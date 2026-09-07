import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/register-form";

export const metadata: Metadata = { title: "Registrieren" };

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-4xl">Mitmachen</h1>
      <p className="mt-2 mb-8 text-muted">
        Schon dabei?{" "}
        <Link href="/anmelden" className="font-semibold text-brand">
          Anmelden
        </Link>
      </p>
      <RegisterForm />
    </div>
  );
}
