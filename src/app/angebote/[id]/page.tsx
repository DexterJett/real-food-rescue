import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { FollowButton } from "@/components/follow-button";
import { ReserveForm } from "@/components/reserve-form";
import {
  categoryEmoji,
  categoryLabel,
  conditionHint,
  conditionLabel,
  producerTypeLabel,
  type Category,
  type Condition,
  type ProducerType,
} from "@/lib/catalog";
import { formatEuro, formatPickupWindow } from "@/lib/format";
import { discountPercent, remainingQuantity } from "@/lib/listing-utils";

export const metadata: Metadata = { title: "Angebot" };
export const dynamic = "force-dynamic";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      producer: true,
      reservations: user
        ? { where: { userId: user.id, status: "ACTIVE" } }
        : false,
    },
  });
  if (!listing) notFound();

  const remaining = remainingQuantity(listing);
  const discount = discountPercent(
    listing.originalPriceCents,
    listing.rescuePriceCents,
  );
  const following = user
    ? Boolean(
        await prisma.follow.findUnique({
          where: {
            userId_producerId: {
              userId: user.id,
              producerId: listing.producerId,
            },
          },
        }),
      )
    : false;
  const ownReservation = Array.isArray(listing.reservations)
    ? listing.reservations[0]
    : null;
  const isOwn = user?.producer?.id === listing.producerId;
  const now = new Date();
  const canReserve =
    listing.status === "ACTIVE" &&
    remaining > 0 &&
    listing.pickupEnd.getTime() > now.getTime() &&
    !isOwn &&
    !ownReservation;

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.4fr_0.8fr]">
      <article className="rounded-3xl border border-line bg-card p-6 sm:p-8">
        <p className="text-sm text-muted">
          {categoryEmoji[listing.category as Category]}{" "}
          {categoryLabel[listing.category as Category]} ·{" "}
          {conditionLabel[listing.condition as Condition]}
        </p>
        <h1 className="mt-2 font-display text-4xl">{listing.title}</h1>
        <p className="mt-4 text-lg leading-relaxed">{listing.description}</p>
        <p className="mt-4 rounded-2xl bg-soft px-4 py-3 text-sm text-muted">
          {conditionHint[listing.condition as Condition]}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <span className="text-4xl font-semibold text-brand">
            {formatEuro(listing.rescuePriceCents)}
          </span>
          <span className="text-muted line-through">
            {formatEuro(listing.originalPriceCents)}
          </span>
          {discount > 0 ? (
            <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
              {discount} % günstiger
            </span>
          ) : null}
        </div>
        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-background px-4 py-3">
            <dt className="flex items-center gap-2 text-sm text-muted">
              <Clock className="h-4 w-4" /> Abholung
            </dt>
            <dd className="mt-1 font-medium">
              {formatPickupWindow(listing.pickupStart, listing.pickupEnd)}
            </dd>
          </div>
          <div className="rounded-2xl bg-background px-4 py-3">
            <dt className="flex items-center gap-2 text-sm text-muted">
              <MapPin className="h-4 w-4" /> Ort
            </dt>
            <dd className="mt-1 font-medium">
              {listing.producer.street}, {listing.producer.zip}{" "}
              {listing.producer.city}
            </dd>
          </div>
        </dl>
        <p className="mt-6 text-sm text-muted">
          Noch {remaining} von {listing.quantity} verfügbar.
        </p>
      </article>

      <aside className="space-y-4">
        <div className="rounded-3xl border border-line bg-card p-6">
          <p className="text-sm text-muted">
            {producerTypeLabel[listing.producer.type as ProducerType]}
          </p>
          <Link
            href={`/hersteller/${listing.producer.id}`}
            className="font-display text-2xl hover:text-brand"
          >
            {listing.producer.businessName}
          </Link>
          <p className="mt-2 text-sm text-muted">{listing.producer.description}</p>
          {listing.producer.pickupHint ? (
            <p className="mt-3 text-sm">
              Abholung: {listing.producer.pickupHint}
            </p>
          ) : null}
          {user?.role === "CONSUMER" ? (
            <div className="mt-4">
              <FollowButton
                producerId={listing.producer.id}
                following={following}
              />
            </div>
          ) : null}
        </div>

        <div className="rounded-3xl border border-line bg-card p-6">
          {ownReservation ? (
            <div>
              <p className="font-semibold">Du hast reserviert</p>
              <p className="mt-2 font-display text-4xl tracking-[0.3em]">
                {ownReservation.pickupCode}
              </p>
              <p className="mt-2 text-sm text-muted">
                Zeig diesen Code beim Abholen vor.
              </p>
              <Link
                href="/reservierungen"
                className="mt-4 inline-block text-sm font-semibold text-brand"
              >
                Zu meinen Reservierungen
              </Link>
            </div>
          ) : isOwn ? (
            <Link
              href={`/dashboard/angebote/${listing.id}`}
              className="font-semibold text-brand"
            >
              Im Betrieb bearbeiten
            </Link>
          ) : canReserve ? (
            user ? (
              <ReserveForm listingId={listing.id} remaining={remaining} />
            ) : (
              <Link
                href={`/anmelden?next=/angebote/${listing.id}`}
                className="block rounded-full bg-brand px-5 py-3 text-center font-semibold text-white"
              >
                Anmelden zum Reservieren
              </Link>
            )
          ) : (
            <p className="text-muted">Aktuell nicht reservierbar.</p>
          )}
        </div>
      </aside>
    </div>
  );
}
