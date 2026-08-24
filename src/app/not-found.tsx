import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="font-display text-4xl">Seite nicht gefunden</h1>
      <p className="mt-3 text-muted">
        Dieses Angebot oder diese Seite gibt es nicht (mehr).
      </p>
      <Link
        href="/entdecken"
        className="mt-6 inline-block rounded-full bg-brand px-5 py-3 font-semibold text-white"
      >
        Zu den Angeboten
      </Link>
    </div>
  );
}
