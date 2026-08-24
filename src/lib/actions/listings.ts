"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { CATEGORIES, CONDITIONS } from "@/lib/catalog";
import { listingStatusFromCounts, moneyToCents } from "@/lib/listing-utils";
import { dispatchListingNotifications } from "@/lib/dispatch";
import { saveListingImage } from "@/lib/images";
import type { ActionState } from "./auth";

const listingSchema = z
  .object({
    title: z.string().trim().min(3, "Titel zu kurz.").max(80),
    description: z.string().trim().min(10, "Bitte etwas genauer beschreiben.").max(800),
    category: z.enum(CATEGORIES),
    condition: z.enum(CONDITIONS),
    originalPrice: z.coerce.number().positive("Bitte den normalen Preis angeben."),
    rescuePrice: z.coerce.number().min(0, "Rettungspreis darf nicht negativ sein."),
    quantity: z.coerce.number().int().min(1).max(99),
    pickupStart: z.string().min(1, "Abholbeginn fehlt."),
    pickupEnd: z.string().min(1, "Abholende fehlt."),
    mhdPlus: z.boolean(),
    bestBeforeDate: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.rescuePrice > data.originalPrice) {
      ctx.addIssue({
        code: "custom",
        message: "Der Rettungspreis sollte nicht über dem normalen Preis liegen.",
        path: ["rescuePrice"],
      });
    }
    const start = new Date(data.pickupStart);
    const end = new Date(data.pickupEnd);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      ctx.addIssue({
        code: "custom",
        message: "Bitte gültige Abholzeiten angeben.",
        path: ["pickupStart"],
      });
    } else if (end <= start) {
      ctx.addIssue({
        code: "custom",
        message: "Das Abholende muss nach dem Beginn liegen.",
        path: ["pickupEnd"],
      });
    }
  });

function parseListingForm(formData: FormData) {
  const mhdChecked =
    formData.get("mhdPlus") === "on" || formData.get("mhdPlus") === "true";
  const condition = String(formData.get("condition") ?? "");
  return listingSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    condition: formData.get("condition"),
    originalPrice: formData.get("originalPrice"),
    rescuePrice: formData.get("rescuePrice"),
    quantity: formData.get("quantity"),
    pickupStart: formData.get("pickupStart"),
    pickupEnd: formData.get("pickupEnd"),
    mhdPlus: mhdChecked || condition === "BEST_BEFORE",
    bestBeforeDate: String(formData.get("bestBeforeDate") ?? "") || undefined,
  });
}

function bestBeforeFromForm(value?: string) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function requireProducer() {
  const user = await getSessionUser();
  if (!user || user.role !== "PRODUCER" || !user.producer) {
    return {
      ok: false as const,
      error: user
        ? "Nur Hersteller können Angebote einstellen."
        : "Bitte zuerst anmelden.",
    };
  }
  return { ok: true as const, user, producer: user.producer };
}

export async function createListingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const producer = await requireProducer();
  if (!producer.ok) return { error: producer.error };

  const parsed = parseListingForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Angaben." };
  }

  let imagePath: string | null = null;
  try {
    imagePath = await saveListingImage(formData.get("image") as File | null);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Bild konnte nicht gespeichert werden.",
    };
  }

  const listing = await prisma.listing.create({
    data: {
      producerId: producer.producer.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      condition: parsed.data.condition,
      originalPriceCents: moneyToCents(parsed.data.originalPrice),
      rescuePriceCents: moneyToCents(parsed.data.rescuePrice),
      quantity: parsed.data.quantity,
      pickupStart: new Date(parsed.data.pickupStart),
      pickupEnd: new Date(parsed.data.pickupEnd),
      status: "ACTIVE",
      imagePath,
      mhdPlus: parsed.data.mhdPlus,
      bestBeforeDate: bestBeforeFromForm(parsed.data.bestBeforeDate),
    },
  });

  await dispatchListingNotifications(listing.id);
  revalidatePath("/entdecken");
  revalidatePath("/dashboard");
  revalidatePath("/mitteilungen");
  revalidatePath("/konto");
  redirect("/dashboard");
}

export async function updateListingAction(
  listingId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const producer = await requireProducer();
  if (!producer.ok) return { error: producer.error };

  const existing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!existing || existing.producerId !== producer.producer.id) {
    return { error: "Angebot nicht gefunden." };
  }

  const parsed = parseListingForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Angaben." };
  }

  if (parsed.data.quantity < existing.reservedCount) {
    return {
      error: `Es sind bereits ${existing.reservedCount} Stück reserviert. Menge nicht unter diesen Wert setzen.`,
    };
  }

  let imagePath = existing.imagePath;
  try {
    imagePath = await saveListingImage(
      formData.get("image") as File | null,
      existing.imagePath,
    );
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Bild konnte nicht gespeichert werden.",
    };
  }

  const pickupEnd = new Date(parsed.data.pickupEnd);
  await prisma.listing.update({
    where: { id: listingId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      condition: parsed.data.condition,
      originalPriceCents: moneyToCents(parsed.data.originalPrice),
      rescuePriceCents: moneyToCents(parsed.data.rescuePrice),
      quantity: parsed.data.quantity,
      pickupStart: new Date(parsed.data.pickupStart),
      pickupEnd,
      status: listingStatusFromCounts({
        reservedCount: existing.reservedCount,
        quantity: parsed.data.quantity,
        pickupEnd,
        cancelled: existing.status === "CANCELLED",
      }),
      imagePath,
      mhdPlus: parsed.data.mhdPlus,
      bestBeforeDate: bestBeforeFromForm(parsed.data.bestBeforeDate),
    },
  });

  revalidatePath("/entdecken");
  revalidatePath("/dashboard");
  revalidatePath(`/angebote/${listingId}`);
  redirect("/dashboard");
}

export async function cancelListingAction(listingId: string): Promise<void> {
  const producer = await requireProducer();
  if (!producer.ok) redirect("/anmelden");

  const existing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!existing || existing.producerId !== producer.producer.id) {
    redirect("/dashboard");
  }

  await prisma.listing.update({
    where: { id: listingId },
    data: { status: "CANCELLED" },
  });
  await prisma.reservation.updateMany({
    where: { listingId, status: "ACTIVE" },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/entdecken");
  revalidatePath("/dashboard");
  revalidatePath("/reservierungen");
  redirect("/dashboard");
}
