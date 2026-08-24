"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { registerAction, type ActionState } from "@/lib/actions/auth";
import { PRODUCER_TYPES, producerTypeLabel } from "@/lib/catalog";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
    >
      {pending ? "Konto wird angelegt…" : "Konto erstellen"}
    </button>
  );
}

export function RegisterForm() {
  const [role, setRole] = useState<"CONSUMER" | "PRODUCER">("CONSUMER");
  const [state, action] = useActionState(registerAction, null as ActionState);

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-full bg-soft p-1">
        <button
          type="button"
          onClick={() => setRole("CONSUMER")}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            role === "CONSUMER" ? "bg-card text-foreground shadow-sm" : "text-muted"
          }`}
        >
          Ich rette
        </button>
        <button
          type="button"
          onClick={() => setRole("PRODUCER")}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            role === "PRODUCER" ? "bg-card text-foreground shadow-sm" : "text-muted"
          }`}
        >
          Ich biete an
        </button>
      </div>
      <input type="hidden" name="role" value={role} />

      <label className="block">
        <span className="mb-1 block text-sm font-medium">
          {role === "PRODUCER" ? "Ansprechperson" : "Name"}
        </span>
        <input
          name="name"
          required
          className="w-full rounded-2xl border border-line bg-card px-4 py-3 outline-none ring-brand focus:ring-2"
        />
      </label>
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
          minLength={8}
          required
          className="w-full rounded-2xl border border-line bg-card px-4 py-3 outline-none ring-brand focus:ring-2"
        />
      </label>

      {role === "PRODUCER" ? (
        <div className="space-y-4 rounded-3xl border border-line bg-soft/60 p-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Betriebsname</span>
            <input
              name="businessName"
              required
              placeholder="Bäckerei Sonnenschein"
              className="w-full rounded-2xl border border-line bg-card px-4 py-3 outline-none ring-brand focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Art des Betriebs</span>
            <select
              name="producerType"
              required
              className="w-full rounded-2xl border border-line bg-card px-4 py-3 outline-none ring-brand focus:ring-2"
            >
              {PRODUCER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {producerTypeLabel[type]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Straße</span>
            <input
              name="street"
              required
              className="w-full rounded-2xl border border-line bg-card px-4 py-3 outline-none ring-brand focus:ring-2"
            />
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="col-span-1 block">
              <span className="mb-1 block text-sm font-medium">PLZ</span>
              <input
                name="zip"
                required
                className="w-full rounded-2xl border border-line bg-card px-4 py-3 outline-none ring-brand focus:ring-2"
              />
            </label>
            <label className="col-span-2 block">
              <span className="mb-1 block text-sm font-medium">Ort</span>
              <input
                name="city"
                required
                className="w-full rounded-2xl border border-line bg-card px-4 py-3 outline-none ring-brand focus:ring-2"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Kurzbeschreibung</span>
            <textarea
              name="description"
              rows={3}
              className="w-full rounded-2xl border border-line bg-card px-4 py-3 outline-none ring-brand focus:ring-2"
            />
          </label>
        </div>
      ) : null}

      {state?.error ? (
        <p className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent">
          {state.error}
        </p>
      ) : null}
      <Submit />
    </form>
  );
}
