"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateAccountAction } from "@/lib/actions/account";
import type { ActionState } from "@/lib/actions/auth";
import { formatPhoneDisplay } from "@/lib/phone";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
    >
      {pending ? "Speichern…" : "Einstellungen speichern"}
    </button>
  );
}

export function AccountForm({
  email,
  phone,
  notifyEmail,
  notifyWhatsapp,
  saved,
}: {
  email: string;
  phone: string | null;
  notifyEmail: boolean;
  notifyWhatsapp: boolean;
  saved?: boolean;
}) {
  const [state, action] = useActionState(updateAccountAction, null as ActionState);

  return (
    <form action={action} className="space-y-4">
      <p className="text-sm text-muted">Angemeldet als {email}</p>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">WhatsApp-Nummer</span>
        <input
          name="phone"
          type="tel"
          defaultValue={phone ? formatPhoneDisplay(phone) : ""}
          placeholder="+423 234 56 78"
          className="w-full rounded-2xl border border-line bg-card px-4 py-3"
        />
      </label>
      <label className="flex items-start gap-3 rounded-2xl border border-line bg-card p-4">
        <input
          type="checkbox"
          name="notifyEmail"
          defaultChecked={notifyEmail}
          className="mt-1"
        />
        <span>
          <span className="font-medium">E-Mail-Mitteilungen</span>
          <span className="mt-1 block text-sm text-muted">
            Neue Angebote von gefolgten Betrieben und abonnierten Produkten.
          </span>
        </span>
      </label>
      <label className="flex items-start gap-3 rounded-2xl border border-line bg-card p-4">
        <input
          type="checkbox"
          name="notifyWhatsapp"
          defaultChecked={notifyWhatsapp}
          className="mt-1"
        />
        <span>
          <span className="font-medium">WhatsApp-Mitteilungen</span>
          <span className="mt-1 block text-sm text-muted">
            Kurznachricht aufs Handy. Ohne Twilio-Zugang speichern wir sie im
            Postausgang (Demo).
          </span>
        </span>
      </label>
      {saved && !state?.error ? (
        <p className="rounded-2xl bg-soft px-4 py-3 text-sm text-brand">
          Gespeichert.
        </p>
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
