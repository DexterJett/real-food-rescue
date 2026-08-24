import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { markNotificationsReadAction } from "@/lib/actions/social";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Mitteilungen" };

export default async function NotificationsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/anmelden");

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    include: { listing: { include: { producer: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Mitteilungen</h1>
          <p className="mt-2 text-muted">
            Neue Angebote von gefolgten Betrieben und abonnierten Produkten.
          </p>
        </div>
        {notifications.some((item) => !item.read) ? (
          <form action={markNotificationsReadAction}>
            <button
              type="submit"
              className="rounded-full border border-line px-4 py-2 text-sm"
            >
              Alle gelesen
            </button>
          </form>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <p className="mt-8 rounded-3xl border border-dashed border-line bg-card p-8 text-muted">
          Noch still hier. Folge Herstellern oder abonniere Kategorien, dann
          trudeln die Hinweise ein.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {notifications.map((item) => (
            <li
              key={item.id}
              className={`rounded-3xl border p-5 ${
                item.read ? "border-line bg-card" : "border-brand/30 bg-soft"
              }`}
            >
              <p className="text-xs text-muted">{formatDateTime(item.createdAt)}</p>
              <h2 className="mt-1 font-semibold">{item.title}</h2>
              <p className="mt-1 text-sm text-muted">{item.body}</p>
              {item.listing ? (
                <Link
                  href={`/angebote/${item.listing.id}`}
                  className="mt-3 inline-block text-sm font-semibold text-brand"
                >
                  Angebot ansehen
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
