import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { ListingForm } from "@/components/listing-form";

export const metadata: Metadata = { title: "Neues Angebot" };

export default async function NewListingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/anmelden");
  if (user.role !== "PRODUCER") redirect("/entdecken");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-4xl">Lebensmittel einstellen</h1>
      <p className="mt-2 mb-8 text-muted">
        Preis in CHF, Foto, MHD+ falls nötig, Abholung in deiner Gemeinde.
        Wer dir folgt, bekommt App-, E-Mail- und optional WhatsApp-Mitteilung.
        Zahlung nur vor Ort.
      </p>
      <ListingForm />
    </div>
  );
}
