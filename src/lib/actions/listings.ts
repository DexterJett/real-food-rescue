"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import {
  CATEGORIES,
  CONDITIONS,
  categoryLabel,
  isCategory,
} from "@/lib/catalog";
import { eurosToCents, listingStatusFromCounts } from "@/lib/listing-utils";
import { matchNotificationReasons, notificationCopy } from "@/lib/notify";
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

async function notifyFollowers(listingId: string) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { producer: true },
  });
  if (!listing || !isCategory(listing.category)) return;

  const [follows, subscriptions] = await Promise.all([
    prisma.follow.findMany({
      where: { producerId: listing.producerId },
      select: { userId: true },
    }),
    prisma.categorySubscription.findMany({
      where: { category: listing.category },
      select: { userId: true, category: true },
    }),
  ]);

  const userIds = new Set<string>([
    ...follows.map((item) => item.userId),
    ...subscriptions.map((item) => item.userId),
  ]);
  userIds.delete(listing.producer.userId);

  if (userIds.size === 0) return;

  const users = await prisma.user.findMany({
    where: { id: { in: [...userIds] }, role: "CONSUMER" },
    include: {
      follows: { select: { producerId: true } },
      subscriptions: { select: { category: true } },
    },
  });

  const rows = users
    .map((user) => {
      const reasons = matchNotificationReasons({
        producerId: listing.producerId,
        category: listing.category,
        followedProducerIds: user.follows.map((item) => item.producerId),
        subscribedCategories: user.subscriptions.map((item) => item.category),
      });
      if (reasons.length === 0) return null;
      const copy = notificationCopy({
        reasons,
        producerName: listing.producer.businessName,
        listingTitle: listing.title,
        categoryLabel: categoryLabel[listing.category as keyof typeof categoryLabel],
      });
      return {
        userId: user.id,
        listingId: listing.id,
        title: copy.title,
        body: copy.body,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  if (rows.length > 0) {
    await prisma.notification.createMany({ data: rows });
  }
}

export async function createListingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const producer = await requireProducer();
  if (!producer.ok) return { error: producer.error };

  const parsed = listingSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    condition: formData.get("condition"),
    originalPrice: formData.get("originalPrice"),
    rescuePrice: formData.get("rescuePrice"),
    quantity: formData.get("quantity"),
    pickupStart: formData.get("pickupStart"),
    pickupEnd: formData.get("pickupEnd"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Angaben." };
  }

  const listing = await prisma.listing.create({
    data: {
      producerId: producer.producer.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      condition: parsed.data.condition,
      originalPriceCents: eurosToCents(parsed.data.originalPrice),
      rescuePriceCents: eurosToCents(parsed.data.rescuePrice),
      quantity: parsed.data.quantity,
      pickupStart: new Date(parsed.data.pickupStart),
      pickupEnd: new Date(parsed.data.pickupEnd),
      status: "ACTIVE",
    },
  });

  await notifyFollowers(listing.id);
  revalidatePath("/entdecken");
  revalidatePath("/dashboard");
  revalidatePath("/mitteilungen");
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

  const parsed = listingSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    condition: formData.get("condition"),
    originalPrice: formData.get("originalPrice"),
    rescuePrice: formData.get("rescuePrice"),
    quantity: formData.get("quantity"),
    pickupStart: formData.get("pickupStart"),
    pickupEnd: formData.get("pickupEnd"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Angaben." };
  }

  if (parsed.data.quantity < existing.reservedCount) {
    return {
      error: `Es sind bereits ${existing.reservedCount} Stück reserviert. Menge nicht unter diesen Wert setzen.`,
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
      originalPriceCents: eurosToCents(parsed.data.originalPrice),
      rescuePriceCents: eurosToCents(parsed.data.rescuePrice),
      quantity: parsed.data.quantity,
      pickupStart: new Date(parsed.data.pickupStart),
      pickupEnd,
      status: listingStatusFromCounts({
        reservedCount: existing.reservedCount,
        quantity: parsed.data.quantity,
        pickupEnd,
        cancelled: existing.status === "CANCELLED",
      }),
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
