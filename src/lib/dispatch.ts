import { prisma } from "./prisma";
import { categoryLabel, isCategory } from "./catalog";
import {
  appBaseUrl,
  emailCopy,
  matchNotificationReasons,
  notificationCopy,
  whatsappCopy,
} from "./notify";
import { sendListingEmail, sendListingWhatsapp } from "./messaging";

export async function dispatchListingNotifications(listingId: string) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { producer: true },
  });
  if (!listing || !isCategory(listing.category)) return;

  const [follows, subscriptions] = await Promise.all([
    prisma.follow.findMany({
      where: { producerId: listing.producerId },
      select: { userId: true },
    }),
    prisma.categorySubscription.findMany({
      where: { category: listing.category },
      select: { userId: true },
    }),
  ]);

  const userIds = new Set<string>([
    ...follows.map((item) => item.userId),
    ...subscriptions.map((item) => item.userId),
  ]);
  userIds.delete(listing.producer.userId);
  if (userIds.size === 0) return;

  const users = await prisma.user.findMany({
    where: { id: { in: [...userIds] }, role: "CONSUMER" },
    include: {
      follows: { select: { producerId: true } },
      subscriptions: { select: { category: true } },
    },
  });

  const url = `${appBaseUrl()}/angebote/${listing.id}`;

  for (const user of users) {
    const reasons = matchNotificationReasons({
      producerId: listing.producerId,
      category: listing.category,
      followedProducerIds: user.follows.map((item) => item.producerId),
      subscribedCategories: user.subscriptions.map((item) => item.category),
    });
    if (reasons.length === 0) continue;

    const copy = notificationCopy({
      reasons,
      producerName: listing.producer.businessName,
      listingTitle: listing.title,
      categoryLabel: categoryLabel[listing.category],
      mhdPlus: listing.mhdPlus,
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        listingId: listing.id,
        title: copy.title,
        body: copy.body,
      },
    });

    if (user.notifyEmail) {
      const mail = emailCopy({
        title: copy.title,
        body: copy.body,
        producerName: listing.producer.businessName,
        city: listing.producer.city,
        url,
      });
      await sendListingEmail({
        userId: user.id,
        listingId: listing.id,
        to: user.email,
        subject: mail.subject,
        body: mail.text,
      });
    }

    if (user.notifyWhatsapp && user.phone) {
      await sendListingWhatsapp({
        userId: user.id,
        listingId: listing.id,
        to: user.phone,
        body: whatsappCopy({ title: copy.title, body: copy.body, url }),
      });
    }
  }
}
