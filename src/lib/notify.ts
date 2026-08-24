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
  mhdPlus?: boolean;
}): { title: string; body: string } {
  const mhd = input.mhdPlus ? " MHD+" : "";
  if (input.reasons.includes("producer") && input.reasons.includes("category")) {
    return {
      title: `Neu bei ${input.producerName}`,
      body: `${input.listingTitle}${mhd} (${input.categoryLabel}) ist jetzt zum Retten da. Zahlung nur vor Ort.`,
    };
  }
  if (input.reasons.includes("producer")) {
    return {
      title: `${input.producerName} hat etwas Neues`,
      body: `${input.listingTitle}${mhd} wartet auf Abholung. Zahlung nur vor Ort.`,
    };
  }
  return {
    title: `Neues Angebot: ${input.categoryLabel}`,
    body: `${input.producerName} bietet ${input.listingTitle}${mhd} an. Zahlung nur vor Ort.`,
  };
}

export function emailCopy(input: {
  title: string;
  body: string;
  producerName: string;
  city: string;
  url: string;
}) {
  return {
    subject: `${input.title} · NochGut Liechtenstein`,
    text: [
      input.body,
      "",
      `Betrieb: ${input.producerName}, ${input.city}`,
      "Zahlung nur vor Ort (bar oder Karte im Laden).",
      "",
      `Angebot ansehen: ${input.url}`,
    ].join("\n"),
  };
}

export function whatsappCopy(input: {
  title: string;
  body: string;
  url: string;
}) {
  return `NochGut: ${input.title}\n${input.body}\n${input.url}`;
}

export function appBaseUrl() {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
