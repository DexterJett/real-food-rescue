"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { normalizePhone } from "@/lib/phone";
import type { ActionState } from "./auth";

export async function updateAccountAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) redirect("/anmelden");

  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const notifyEmail = formData.get("notifyEmail") === "on";
  const notifyWhatsapp = formData.get("notifyWhatsapp") === "on";
  const phone = phoneRaw ? normalizePhone(phoneRaw) : null;

  if (phoneRaw && !phone) {
    return {
      error:
        "Bitte eine gültige Nummer angeben, z. B. +423 234 56 78 (Liechtenstein) oder +41 …",
    };
  }
  if (notifyWhatsapp && !phone) {
    return { error: "Für WhatsApp brauchen wir eine Mobilnummer." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      phone,
      notifyEmail,
      notifyWhatsapp,
    },
  });

  revalidatePath("/konto");
  revalidatePath("/mitteilungen");
  redirect("/konto?ok=1");
}
