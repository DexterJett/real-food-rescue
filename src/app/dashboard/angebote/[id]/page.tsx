import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { ListingForm } from "@/components/listing-form";
import { cancelListingAction } from "@/lib/actions/listings";
import { markPickedUpAction } from "@/lib/actions/reservations";
import { toDateTimeLocal } from "@/lib/format";

export const metadata: Metadata = { title: "Angebot bearbeiten" };

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user?.producer) redirect("/anmelden");
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      reservations: {
        include: { user: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!listing || listing.producerId !== user.producer.id) notFound();

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-2">
      <div>
        <h1 className="font-display text-4xl">Angebot bearbeiten</h1>
        <p className="mt-2 mb-8 text-muted">{listing.title}</p>
        <ListingForm
          listingId={listing.id}
          defaults={{
            title: listing.title,
            description: listing.description,
            category: listing.category,
            condition: listing.condition,
            originalPrice: String(listing.originalPriceCents / 100),
            rescuePrice: String(listing.rescuePriceCents / 100),
            quantity: String(listing.quantity),
            pickupStart: toDateTimeLocal(listing.pickupStart),
            pickupEnd: toDateTimeLocal(listing.pickupEnd),
          }}
        />
        {listing.status !== "CANCELLED" ? (
          <form action={cancelListingAction.bind(null, listing.id)} className="mt-6">
            <button type="submit" className="text-sm font-medium text-accent">
              Angebot zurückziehen
            </button>
          </form>
        ) : null}
      </div>

      <div>
        <h2 className="font-display text-2xl">Reservierungen</h2>
        {listing.reservations.length === 0 ? (
          <p className="mt-4 text-muted">Noch niemand hat reserviert.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {listing.reservations.map((reservation) => (
              <li
                key={reservation.id}
                className="rounded-3xl border border-line bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{reservation.user.name}</p>
                    <p className="text-sm text-muted">
                      {reservation.quantity} Stück · {reservation.status}
                    </p>
                  </div>
                  <p className="font-display text-2xl tracking-[0.2em]">
                    {reservation.pickupCode}
                  </p>
                </div>
                {reservation.status === "ACTIVE" ? (
                  <form
                    action={markPickedUpAction.bind(null, reservation.id)}
                    className="mt-3"
                  >
                    <button
                      type="submit"
                      className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
                    >
                      Als abgeholt markieren
                    </button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
