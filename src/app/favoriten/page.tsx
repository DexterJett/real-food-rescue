import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { FollowButton } from "@/components/follow-button";
import { CategoryToggles } from "@/components/category-toggles";
import { producerTypeLabel, type ProducerType } from "@/lib/catalog";

export const metadata: Metadata = { title: "Mein Bäcker" };

export default async function FavoritesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/anmelden");
  if (user.role !== "CONSUMER") redirect("/dashboard");

  const [follows, subscriptions] = await Promise.all([
    prisma.follow.findMany({
      where: { userId: user.id },
      include: { producer: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.categorySubscription.findMany({
      where: { userId: user.id },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-4xl">Mein Bäcker & meine Produkte</h1>
      <p className="mt-2 text-muted">
        Folge Betrieben wie deiner Stammbäckerei. Abonniere Kategorien wie Brot
        oder Joghurt. Sobald etwas passt, bekommst du eine Mitteilung.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-2xl">Produktkategorien</h2>
        <p className="mt-1 mb-4 text-sm text-muted">
          Tippe zum Ein- oder Ausschalten.
        </p>
        <CategoryToggles
          selected={subscriptions.map((item) => item.category)}
        />
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Gefolgte Hersteller</h2>
        {follows.length === 0 ? (
          <p className="mt-4 rounded-3xl border border-dashed border-line bg-card p-6 text-muted">
            Noch niemandem gefolgt. Schau unter{" "}
            <Link href="/entdecken" className="font-semibold text-brand">
              Entdecken
            </Link>{" "}
            vorbei und folge deinem Bäcker, der Metzgerei oder dem Hofladen.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {follows.map((follow) => (
              <li
                key={follow.id}
                className="flex items-center justify-between gap-3 rounded-3xl border border-line bg-card p-4"
              >
                <div>
                  <Link
                    href={`/hersteller/${follow.producer.id}`}
                    className="font-semibold hover:text-brand"
                  >
                    {follow.producer.businessName}
                  </Link>
                  <p className="text-sm text-muted">
                    {producerTypeLabel[follow.producer.type as ProducerType]} ·{" "}
                    {follow.producer.city}
                  </p>
                </div>
                <FollowButton producerId={follow.producer.id} following />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
