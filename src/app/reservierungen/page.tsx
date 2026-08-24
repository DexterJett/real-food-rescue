import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { cancelReservationAction } from "@/lib/actions/reservations";
import { formatEuro, formatPickupWindow } from "@/lib/format";

export const metadata: Metadata = { title: "Reservierungen" };

export default async function ReservationsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/anmelden");
  if (user.role !== "CONSUMER") redirect("/dashboard");

  const reservations = await prisma.reservation.findMany({
    where: { userId: user.id },
    include: { listing: { include: { producer: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-4xl">Deine Reservierungen</h1>
      <p className="mt-2 text-muted">
        Den Abholcode an der Theke zeigen. Bezahlen tust du vor Ort.
      </p>

      {reservations.length === 0 ? (
        <p className="mt-8 rounded-3xl border border-dashed border-line bg-card p-8 text-muted">
          Noch nichts reserviert.{" "}
          <Link href="/entdecken" className="font-semibold text-brand">
            Angebote ansehen
          </Link>
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {reservations.map((item) => (
            <li
              key={item.id}
              className="rounded-3xl border border-line bg-card p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted">
                    {item.listing.producer.businessName}
                  </p>
                  <Link
                    href={`/angebote/${item.listing.id}`}
                    className="font-display text-2xl hover:text-brand"
                  >
                    {item.listing.title}
                  </Link>
                  <p className="mt-1 text-sm text-muted">
                    {item.quantity}× · {formatEuro(item.listing.rescuePriceCents)} ·{" "}
                    {formatPickupWindow(
                      item.listing.pickupStart,
                      item.listing.pickupEnd,
                    )}
                  </p>
                  <p className="mt-2 text-sm">
                    {item.listing.producer.street}, {item.listing.producer.zip}{" "}
                    {item.listing.producer.city}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-muted">
                    {item.status === "ACTIVE"
                      ? "Abholcode"
                      : item.status === "PICKED_UP"
                        ? "Abgeholt"
                        : "Storniert"}
                  </p>
                  {item.status === "ACTIVE" ? (
                    <p className="font-display text-3xl tracking-[0.25em]">
                      {item.pickupCode}
                    </p>
                  ) : null}
                </div>
              </div>
              {item.status === "ACTIVE" ? (
                <form
                  action={cancelReservationAction.bind(null, item.id)}
                  className="mt-4"
                >
                  <button type="submit" className="text-sm font-medium text-accent">
                    Reservierung stornieren
                  </button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
