import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>NochGut Liechtenstein · Lebensmittel retten, bevor sie im Müll landen.</p>
        <div className="flex gap-4">
          <Link href="/hinweise" className="hover:text-foreground">
            Hinweise
          </Link>
          <Link href="/entdecken" className="hover:text-foreground">
            Angebote
          </Link>
        </div>
      </div>
    </footer>
  );
}
