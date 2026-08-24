import Link from "next/link";
import { Leaf, Bell, Store, ShoppingBag, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/listing-card";

export default async function HomePage() {
  const listings = await prisma.listing.findMany({
    where: { status: "ACTIVE", pickupEnd: { gt: new Date() } },
    include: { producer: true },
    orderBy: { pickupEnd: "asc" },
    take: 3,
  });

  return (
    <div>
      <section className="surface-dots border-b border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-soft px-3 py-1 text-sm font-medium text-brand">
              <Leaf className="h-4 w-4" />
              Lebensmittel retten in Liechtenstein
            </p>
            <h1 className="font-display text-4xl leading-tight text-foreground sm:text-6xl">
              Dein Bäcker hat noch Brot.
              <span className="text-brand"> Du holst es ab.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted">
              NochGut startet in Liechtenstein: Bäckereien, Metzgereien,
              Restaurants und Hofläden stellen übrige oder MHD+-Lebensmittel zu
              einem kleinen Preis ein. Du reservierst, holst vor Ort ab und
              bezahlst im Laden.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/entdecken"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
              >
                Angebote durchstöbern
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/registrieren"
                className="inline-flex items-center rounded-full border border-line bg-card px-6 py-3 font-semibold"
              >
                Betrieb anmelden
              </Link>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-3xl bg-brand p-6 text-card">
              <Store className="mb-4 h-8 w-8" />
              <h2 className="font-display text-2xl">Für Hersteller</h2>
              <p className="mt-2 text-card/85">
                Tagesreste, MHD+-Ware oder krummes Gemüse in Minuten einstellen.
                Preis in CHF selbst festlegen. Abholung und Zahlung im Laden.
              </p>
            </div>
            <div className="rounded-3xl bg-card p-6">
              <ShoppingBag className="mb-4 h-8 w-8 text-accent" />
              <h2 className="font-display text-2xl">Für Privatpersonen</h2>
              <p className="mt-2 text-muted">
                Scrollen, filtern, reservieren. Folge „deinem Bäcker“ oder
                abonniere Brot, Joghurt, Gemüse – Mitteilungen kommen in die App,
                per E-Mail und optional per WhatsApp.
              </p>
            </div>
            <div className="rounded-3xl bg-accent p-6 text-white">
              <Bell className="mb-4 h-8 w-8" />
              <h2 className="font-display text-2xl">Mitteilungen statt Zufall</h2>
              <p className="mt-2 text-white/90">
                Neue Angebote landen in der App, im Postfach und – wenn du
                möchtest – auf WhatsApp. MHD+-Produkte sind klar gekennzeichnet.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">
              Gerade verfügbar
            </p>
            <h2 className="font-display text-3xl">Heute noch zu retten</h2>
          </div>
          <Link href="/entdecken" className="text-sm font-semibold text-brand">
            Alle Angebote
          </Link>
        </div>
        {listings.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-line bg-card p-8 text-muted">
            Noch keine Angebote. Sobald Betriebe etwas einstellen, erscheint es hier.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
