import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { formatEuro, formatPickupWindow } from "@/lib/format";
import { listingStatusLabel, type ListingStatus } from "@/lib/catalog";
import { remainingQuantity } from "@/lib/listing-utils";

export const metadata: Metadata = { title: "Betrieb" };

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/anmelden");
  if (user.role !== "PRODUCER" || !user.producer) redirect("/entdecken");

  const listings = await prisma.listing.findMany({
    where: { producerId: user.producer.id },
    include: {
      reservations: {
        where: { status: "ACTIVE" },
        include: { user: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const active = listings.filter((item) => item.status === "ACTIVE").length;
  const reservedPieces = listings.reduce(
    (sum, item) => sum + item.reservedCount,
    0,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">
            {user.producer.businessName}
          </p>
          <h1 className="font-display text-4xl">Dein Betrieb</h1>
          <p className="mt-2 text-muted">
            {active} aktive Angebote · {reservedPieces} reservierte Stücke
          </p>
        </div>
        <Link
          href="/dashboard/neu"
          className="rounded-full bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-dark"
        >
          Angebot einstellen
        </Link>
      </div>

      {listings.length === 0 ? (
        <p className="mt-10 rounded-3xl border border-dashed border-line bg-card p-10 text-muted">
          Noch keine Angebote. Stell Brot, Wurst, Gemüse oder Tagesreste ein –
          zu deinem Preis.
        </p>
      ) : (
        <div className="mt-8 overflow-hidden rounded-3xl border border-line bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-soft text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Angebot</th>
                <th className="px-4 py-3 font-medium">Preis</th>
                <th className="px-4 py-3 font-medium">Verfügbar</th>
                <th className="px-4 py-3 font-medium">Abholung</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing.id} className="border-t border-line">
                  <td className="px-4 py-4">
                    <Link
                      href={`/dashboard/angebote/${listing.id}`}
                      className="font-semibold hover:text-brand"
                    >
                      {listing.title}
                    </Link>
                    <p className="text-muted">
                      {listing.reservations.length} offene Reservierung
                      {listing.reservations.length === 1 ? "" : "en"}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    {formatEuro(listing.rescuePriceCents)}
                  </td>
                  <td className="px-4 py-4">
                    {remainingQuantity(listing)} / {listing.quantity}
                  </td>
                  <td className="px-4 py-4 text-muted">
                    {formatPickupWindow(listing.pickupStart, listing.pickupEnd)}
                  </td>
                  <td className="px-4 py-4">
                    {listingStatusLabel[listing.status as ListingStatus]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
