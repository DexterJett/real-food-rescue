"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { isCategory } from "@/lib/catalog";

export async function toggleFollowAction(producerId: string): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect("/anmelden");
  if (user.role !== "CONSUMER") return;

  const producer = await prisma.producerProfile.findUnique({
    where: { id: producerId },
  });
  if (!producer || producer.userId === user.id) return;

  const existing = await prisma.follow.findUnique({
    where: { userId_producerId: { userId: user.id, producerId } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
  } else {
    await prisma.follow.create({
      data: { userId: user.id, producerId },
    });
  }

  revalidatePath("/favoriten");
  revalidatePath("/entdecken");
  revalidatePath(`/hersteller/${producerId}`);
}

export async function toggleCategoryAction(category: string): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect("/anmelden");
  if (user.role !== "CONSUMER") return;
  if (!isCategory(category)) return;

  const existing = await prisma.categorySubscription.findUnique({
    where: { userId_category: { userId: user.id, category } },
  });

  if (existing) {
    await prisma.categorySubscription.delete({ where: { id: existing.id } });
  } else {
    await prisma.categorySubscription.create({
      data: { userId: user.id, category },
    });
  }

  revalidatePath("/favoriten");
  revalidatePath("/entdecken");
}

export async function markNotificationsReadAction() {
  const user = await getSessionUser();
  if (!user) redirect("/anmelden");

  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });

  revalidatePath("/mitteilungen");
}
