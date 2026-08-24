export type NotifyReason = "producer" | "category";

export function matchNotificationReasons(input: {
  producerId: string;
  category: string;
  followedProducerIds: string[];
  subscribedCategories: string[];
}): NotifyReason[] {
  const reasons: NotifyReason[] = [];
  if (input.followedProducerIds.includes(input.producerId)) {
    reasons.push("producer");
  }
  if (input.subscribedCategories.includes(input.category)) {
    reasons.push("category");
  }
  return reasons;
}

export function notificationCopy(input: {
  reasons: NotifyReason[];
  producerName: string;
  listingTitle: string;
  categoryLabel: string;
}): { title: string; body: string } {
  if (input.reasons.includes("producer") && input.reasons.includes("category")) {
    return {
      title: `Neu bei ${input.producerName}`,
      body: `${input.listingTitle} (${input.categoryLabel}) ist jetzt zum Retten da.`,
    };
  }
  if (input.reasons.includes("producer")) {
    return {
      title: `${input.producerName} hat etwas Neues`,
      body: `${input.listingTitle} wartet auf Abholung.`,
    };
  }
  return {
    title: `Neues Angebot: ${input.categoryLabel}`,
    body: `${input.producerName} bietet ${input.listingTitle} an.`,
  };
}
