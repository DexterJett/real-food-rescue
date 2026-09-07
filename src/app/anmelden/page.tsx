import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = { title: "Anmelden" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-4xl">Willkommen zurück</h1>
      <p className="mt-2 mb-8 text-muted">
        Noch kein Konto?{" "}
        <Link href="/registrieren" className="font-semibold text-brand">
          Registrieren
        </Link>
      </p>
      <LoginForm />
    </div>
  );
}
