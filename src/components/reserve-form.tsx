"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { reserveListingAction } from "@/lib/actions/reservations";
import type { ActionState } from "@/lib/actions/auth";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
    >
      {pending ? "Wird reserviert…" : "Jetzt reservieren"}
    </button>
  );
}

export function ReserveForm({
  listingId,
  remaining,
}: {
  listingId: string;
  remaining: number;
}) {
  const action = reserveListingAction.bind(null, listingId);
  const [state, formAction] = useActionState(action, null as ActionState);

  return (
    <form action={formAction} className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Menge</span>
        <select
          name="quantity"
          defaultValue="1"
          className="w-full rounded-2xl border border-line bg-card px-4 py-3"
        >
          {Array.from({ length: remaining }, (_, index) => index + 1).map(
            (value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ),
          )}
        </select>
      </label>
      {state?.error ? (
        <p className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent">
          {state.error}
        </p>
      ) : null}
      <Submit />
      <p className="text-xs text-muted">
        Zahlung bar oder vor Ort beim Abholen. Du bekommst einen Abholcode.
      </p>
    </form>
  );
}
