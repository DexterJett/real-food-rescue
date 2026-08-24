"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clearSession, createSession } from "@/lib/auth";
import { ROLES, isProducerType, isRole } from "@/lib/catalog";

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Bitte einen Namen angeben.").max(80),
    email: z.string().trim().email("Bitte eine gültige E-Mail angeben.").toLowerCase(),
    password: z.string().min(8, "Mindestens 8 Zeichen."),
    role: z.enum(ROLES),
    businessName: z.string().trim().optional(),
    producerType: z.string().optional(),
    street: z.string().trim().optional(),
    zip: z.string().trim().optional(),
    city: z.string().trim().optional(),
    description: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role !== "PRODUCER") return;
    if (!data.businessName || data.businessName.length < 2) {
      ctx.addIssue({
        code: "custom",
        message: "Bitte den Namen des Betriebs angeben.",
        path: ["businessName"],
      });
    }
    if (!data.producerType || !isProducerType(data.producerType)) {
      ctx.addIssue({
        code: "custom",
        message: "Bitte eine Betriebsart wählen.",
        path: ["producerType"],
      });
    }
    if (!data.street || data.street.length < 3) {
      ctx.addIssue({
        code: "custom",
        message: "Bitte Straße und Hausnummer angeben.",
        path: ["street"],
      });
    }
    if (!data.zip || data.zip.length < 4) {
      ctx.addIssue({
        code: "custom",
        message: "Bitte PLZ angeben.",
        path: ["zip"],
      });
    }
    if (!data.city || data.city.length < 2) {
      ctx.addIssue({
        code: "custom",
        message: "Bitte den Ort angeben.",
        path: ["city"],
      });
    }
  });

export type ActionState = { error?: string } | null;

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    businessName: formData.get("businessName") || undefined,
    producerType: formData.get("producerType") || undefined,
    street: formData.get("street") || undefined,
    zip: formData.get("zip") || undefined,
    city: formData.get("city") || undefined,
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Angaben." };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { error: "Diese E-Mail ist bereits registriert." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
      producer:
        parsed.data.role === "PRODUCER"
          ? {
              create: {
                businessName: parsed.data.businessName!,
                type: parsed.data.producerType!,
                street: parsed.data.street!,
                zip: parsed.data.zip!,
                city: parsed.data.city!,
                description:
                  parsed.data.description ||
                  `${parsed.data.businessName} rettet überschüssige Lebensmittel.`,
              },
            }
          : undefined,
    },
  });

  await createSession(user.id);
  redirect(parsed.data.role === "PRODUCER" ? "/dashboard" : "/entdecken");
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Bitte E-Mail und Passwort eingeben." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "E-Mail oder Passwort stimmt nicht." };
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return { error: "E-Mail oder Passwort stimmt nicht." };
  }

  await createSession(user.id);
  redirect(user.role === "PRODUCER" ? "/dashboard" : "/entdecken");
}

export async function loginDemoAction(role: string) {
  if (!isRole(role)) {
    throw new Error("Ungültige Demo-Rolle");
  }
  const email =
    role === "PRODUCER" ? "baeckerei@nochgut.de" : "emma@nochgut.de";
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Demo-Daten fehlen. Bitte npm run db:setup ausführen.");
  }
  await createSession(user.id);
  redirect(role === "PRODUCER" ? "/dashboard" : "/entdecken");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}
