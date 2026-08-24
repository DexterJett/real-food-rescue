import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { ListingCard } from "@/components/listing-card";
import {
  CATEGORIES,
  categoryEmoji,
  categoryLabel,
  type Category,
} from "@/lib/catalog";

export const metadata: Metadata = { title: "Entdecken" };

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    view?: string;
  }>;
}) {
  const params = await searchParams;
  const user = await getSessionUser();
  const query = params.q?.trim() ?? "";
  const category = params.category ?? "";
  const view = params.view ?? "all";

  const followedIds =
    user && view === "followed"
      ? (
          await prisma.follow.findMany({
            where: { userId: user.id },
            select: { producerId: true },
          })
        ).map((item) => item.producerId)
      : [];

  const subscribedCategories =
    user && view === "products"
      ? (
          await prisma.categorySubscription.findMany({
            where: { userId: user.id },
            select: { category: true },
          })
        ).map((item) => item.category)
      : [];

  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      pickupEnd: { gt: new Date() },
      ...(category ? { category } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query } },
              { description: { contains: query } },
              { producer: { businessName: { contains: query } } },
            ],
          }
        : {}),
      ...(view === "followed" && user
        ? { producerId: { in: followedIds.length ? followedIds : ["__none__"] } }
        : {}),
      ...(view === "products" && user
        ? {
            category: {
              in: subscribedCategories.length ? subscribedCategories : ["__none__"],
            },
          }
        : {}),
    },
    include: { producer: true },
    orderBy: { pickupEnd: "asc" },
  });

  const views = [
    { id: "all", label: "Alle" },
    { id: "followed", label: "Meine Hersteller" },
    { id: "products", label: "Meine Produkte" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl">Was heute noch gut ist</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Durchscrollen oder gezielt filtern. Folge deinem Bäcker, abonniere Brot
        oder Joghurt – und lass dir das Wichtige als Mitteilung schicken.
      </p>

      <form className="mt-8 flex flex-col gap-3 sm:flex-row">
        <input type="hidden" name="view" value={view} />
        {category ? <input type="hidden" name="category" value={category} /> : null}
        <input
          name="q"
          defaultValue={query}
          placeholder="Suche nach Brot, Joghurt, Bäckerei…"
          className="flex-1 rounded-full border border-line bg-card px-5 py-3 outline-none ring-brand focus:ring-2"
        />
        <button
          type="submit"
          className="rounded-full bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
        >
          Suchen
        </button>
      </form>

      {user?.role === "CONSUMER" ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {views.map((item) => (
            <Link
              key={item.id}
              href={`/entdecken?view=${item.id}${category ? `&category=${category}` : ""}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                view === item.id
                  ? "bg-foreground text-card"
                  : "border border-line bg-card text-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/entdecken?view=${view}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
          className={`rounded-full px-4 py-2 text-sm ${
            !category ? "bg-brand text-white" : "border border-line bg-card"
          }`}
        >
          Alle Kategorien
        </Link>
        {CATEGORIES.map((item: Category) => (
          <Link
            key={item}
            href={`/entdecken?view=${view}&category=${item}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
            className={`rounded-full px-4 py-2 text-sm ${
              category === item ? "bg-brand text-white" : "border border-line bg-card"
            }`}
          >
            {categoryEmoji[item]} {categoryLabel[item]}
          </Link>
        ))}
      </div>

      {listings.length === 0 ? (
        <p className="mt-10 rounded-3xl border border-dashed border-line bg-card p-10 text-muted">
          Keine passenden Angebote. Folge Herstellern oder abonniere Kategorien
          unter „Mein Bäcker“.
        </p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
