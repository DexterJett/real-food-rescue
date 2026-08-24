"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { generatePickupCode, remainingQuantity } from "@/lib/listing-utils";
import type { ActionState } from "./auth";

export async function reserveListingAction(
  listingId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/anmelden?next=/angebote/${listingId}`);
  }
  if (user.role !== "CONSUMER") {
    return { error: "Hersteller können keine eigenen Angebote reservieren." };
  }

  const quantity = Number(formData.get("quantity") ?? 1);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    return { error: "Bitte eine Menge zwischen 1 und 10 wählen." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const listing = await tx.listing.findUnique({
        where: { id: listingId },
        include: { producer: true },
      });
      if (!listing || listing.status !== "ACTIVE") {
        throw new Error("Dieses Angebot ist nicht mehr verfügbar.");
      }
      if (listing.producer.userId === user.id) {
        throw new Error("Eigenes Angebot kann nicht reserviert werden.");
      }
      if (listing.pickupEnd.getTime() <= Date.now()) {
        throw new Error("Das Abholfenster ist bereits vorbei.");
      }
      const remaining = remainingQuantity(listing);
      if (quantity > remaining) {
        throw new Error(`Nur noch ${remaining} Stück verfügbar.`);
      }

      const existing = await tx.reservation.findUnique({
        where: { listingId_userId: { listingId, userId: user.id } },
      });
      if (existing && existing.status === "ACTIVE") {
        throw new Error("Du hast dieses Angebot bereits reserviert.");
      }

      const reservedCount = listing.reservedCount + quantity;
      await tx.listing.update({
        where: { id: listingId },
        data: {
          reservedCount,
          status: reservedCount >= listing.quantity ? "SOLD_OUT" : "ACTIVE",
        },
      });

      if (existing) {
        await tx.reservation.update({
          where: { id: existing.id },
          data: {
            quantity,
            status: "ACTIVE",
            pickupCode: generatePickupCode(),
          },
        });
      } else {
        await tx.reservation.create({
          data: {
            listingId,
            userId: user.id,
            quantity,
            pickupCode: generatePickupCode(),
            status: "ACTIVE",
          },
        });
      }
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Reservierung ist fehlgeschlagen.",
    };
  }

  revalidatePath("/entdecken");
  revalidatePath("/reservierungen");
  revalidatePath(`/angebote/${listingId}`);
  redirect("/reservierungen");
}

export async function cancelReservationAction(reservationId: string): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect("/anmelden");

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { listing: true },
  });
  if (!reservation || reservation.userId !== user.id) {
    return;
  }
  if (reservation.status !== "ACTIVE") {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.reservation.update({
      where: { id: reservationId },
      data: { status: "CANCELLED" },
    });
    const reservedCount = Math.max(
      0,
      reservation.listing.reservedCount - reservation.quantity,
    );
    await tx.listing.update({
      where: { id: reservation.listingId },
      data: {
        reservedCount,
        status:
          reservation.listing.status === "CANCELLED"
            ? "CANCELLED"
            : reservedCount >= reservation.listing.quantity
              ? "SOLD_OUT"
              : reservation.listing.pickupEnd.getTime() <= Date.now()
                ? "EXPIRED"
                : "ACTIVE",
      },
    });
  });

  revalidatePath("/entdecken");
  revalidatePath("/reservierungen");
  revalidatePath(`/angebote/${reservation.listingId}`);
}

export async function markPickedUpAction(reservationId: string): Promise<void> {
  const user = await getSessionUser();
  if (!user?.producer) redirect("/anmelden");

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { listing: true },
  });
  if (!reservation || reservation.listing.producerId !== user.producer.id) {
    return;
  }

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: "PICKED_UP" },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/angebote/${reservation.listingId}`);
}
