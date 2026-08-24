"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="font-display text-4xl">Etwas ist schiefgelaufen</h1>
      <p className="mt-3 text-muted">Bitte Seite neu laden oder später nochmal versuchen.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full bg-brand px-5 py-3 font-semibold text-white"
      >
        Nochmal versuchen
      </button>
    </div>
  );
}
