"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/actions/auth";
import {
  createListingAction,
  updateListingAction,
} from "@/lib/actions/listings";
import {
  CATEGORIES,
  CONDITIONS,
  categoryLabel,
  conditionLabel,
} from "@/lib/catalog";
import { addHours, toDateTimeLocal } from "@/lib/format";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
    >
      {pending ? "Speichern…" : label}
    </button>
  );
}

type ListingFormValues = {
  title: string;
  description: string;
  category: string;
  condition: string;
  originalPrice: string;
  rescuePrice: string;
  quantity: string;
  pickupStart: string;
  pickupEnd: string;
  mhdPlus: boolean;
  bestBeforeDate: string;
  imagePath: string | null;
};

export function ListingForm({
  listingId,
  defaults,
}: {
  listingId?: string;
  defaults?: Partial<ListingFormValues>;
}) {
  const now = new Date();
  const action = listingId
    ? updateListingAction.bind(null, listingId)
    : createListingAction;
  const [state, formAction] = useActionState(action, null as ActionState);
  const [condition, setCondition] = useState(defaults?.condition ?? "SURPLUS");
  const [mhdPlus, setMhdPlus] = useState(
    Boolean(defaults?.mhdPlus) || defaults?.condition === "BEST_BEFORE",
  );
  const [preview, setPreview] = useState<string | null>(
    defaults?.imagePath ?? null,
  );

  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Was bietest du an?</span>
        <input
          name="title"
          required
          defaultValue={defaults?.title}
          placeholder="Körnerbrot vom Nachmittag"
          className="w-full rounded-2xl border border-line bg-card px-4 py-3 outline-none ring-brand focus:ring-2"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Beschreibung</span>
        <textarea
          name="description"
          required
          rows={4}
          defaultValue={defaults?.description}
          placeholder="Zustand, Packungsgröße, worauf man achten sollte."
          className="w-full rounded-2xl border border-line bg-card px-4 py-3 outline-none ring-brand focus:ring-2"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Foto vom Produkt</span>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Vorschau"
            className="mb-3 h-40 w-full rounded-2xl object-cover"
          />
        ) : null}
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setPreview(URL.createObjectURL(file));
          }}
          className="w-full rounded-2xl border border-line bg-card px-4 py-3 text-sm"
        />
        <p className="mt-1 text-xs text-muted">JPG, PNG oder WebP, max. 4 MB.</p>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Kategorie</span>
          <select
            name="category"
            defaultValue={defaults?.category ?? "BREAD"}
            className="w-full rounded-2xl border border-line bg-card px-4 py-3"
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {categoryLabel[category]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Zustand</span>
          <select
            name="condition"
            value={condition}
            onChange={(event) => {
              const next = event.target.value;
              setCondition(next);
              if (next === "BEST_BEFORE") setMhdPlus(true);
            }}
            className="w-full rounded-2xl border border-line bg-card px-4 py-3"
          >
            {CONDITIONS.map((item) => (
              <option key={item} value={item}>
                {conditionLabel[item]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="rounded-3xl border border-line bg-soft/70 p-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="mhdPlus"
            value="true"
            checked={mhdPlus}
            onChange={(event) => setMhdPlus(event.target.checked)}
            className="mt-1 h-4 w-4"
          />
          <span>
            <span className="font-semibold">Als MHD+ kennzeichnen</span>
            <span className="mt-1 block text-sm text-muted">
              Für Ware am oder nach dem Mindesthaltbarkeitsdatum. Kundinnen und
              Kunden sehen das orange MHD+-Schild.
            </span>
          </span>
        </label>
        {mhdPlus ? (
          <label className="mt-4 block">
            <span className="mb-1 block text-sm font-medium">
              Mindesthaltbarkeitsdatum
            </span>
            <input
              name="bestBeforeDate"
              type="date"
              defaultValue={defaults?.bestBeforeDate}
              className="w-full rounded-2xl border border-line bg-card px-4 py-3"
            />
          </label>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Normalpreis CHF</span>
          <input
            name="originalPrice"
            type="number"
            min="0.1"
            step="0.1"
            required
            defaultValue={defaults?.originalPrice}
            className="w-full rounded-2xl border border-line bg-card px-4 py-3"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Rettungspreis CHF</span>
          <input
            name="rescuePrice"
            type="number"
            min="0"
            step="0.1"
            required
            defaultValue={defaults?.rescuePrice}
            className="w-full rounded-2xl border border-line bg-card px-4 py-3"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Stückzahl</span>
          <input
            name="quantity"
            type="number"
            min="1"
            max="99"
            required
            defaultValue={defaults?.quantity ?? "3"}
            className="w-full rounded-2xl border border-line bg-card px-4 py-3"
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Abholung von</span>
          <input
            name="pickupStart"
            type="datetime-local"
            required
            defaultValue={
              defaults?.pickupStart ?? toDateTimeLocal(addHours(now, 1))
            }
            className="w-full rounded-2xl border border-line bg-card px-4 py-3"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Abholung bis</span>
          <input
            name="pickupEnd"
            type="datetime-local"
            required
            defaultValue={
              defaults?.pickupEnd ?? toDateTimeLocal(addHours(now, 6))
            }
            className="w-full rounded-2xl border border-line bg-card px-4 py-3"
          />
        </label>
      </div>
      <p className="text-sm text-muted">
        Zahlung nur vor Ort – bar oder mit Karte im Laden, keine Online-Zahlung.
      </p>
      {state?.error ? (
        <p className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent">
          {state.error}
        </p>
      ) : null}
      <Submit label={listingId ? "Änderungen speichern" : "Angebot veröffentlichen"} />
    </form>
  );
}
