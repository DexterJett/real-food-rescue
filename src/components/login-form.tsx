"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, loginDemoAction, type ActionState } from "@/lib/actions/auth";

function Submit({ children }: { children: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
    >
      {pending ? "Bitte warten…" : children}
    </button>
  );
}

export function LoginForm() {
  const [state, action] = useActionState(loginAction, null as ActionState);

  return (
    <div className="space-y-6">
      <form action={action} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">E-Mail</span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-2xl border border-line bg-card px-4 py-3 outline-none ring-brand focus:ring-2"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Passwort</span>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-2xl border border-line bg-card px-4 py-3 outline-none ring-brand focus:ring-2"
          />
        </label>
        {state?.error ? (
          <p className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent">
            {state.error}
          </p>
        ) : null}
        <Submit>Anmelden</Submit>
      </form>

      <div className="grid gap-2 sm:grid-cols-2">
        <form action={loginDemoAction.bind(null, "CONSUMER")}>
          <button
            type="submit"
            className="w-full rounded-full border border-line px-4 py-3 text-sm font-medium hover:bg-soft"
          >
            Demo: Privatperson
          </button>
        </form>
        <form action={loginDemoAction.bind(null, "PRODUCER")}>
          <button
            type="submit"
            className="w-full rounded-full border border-line px-4 py-3 text-sm font-medium hover:bg-soft"
          >
            Demo: Bäckerei
          </button>
        </form>
      </div>
    </div>
  );
}
