export const ROLES = ["CONSUMER", "PRODUCER"] as const;
export type Role = (typeof ROLES)[number];

export const PRODUCER_TYPES = [
  "BAKERY",
  "BUTCHER",
  "RESTAURANT",
  "CAFE",
  "FARM_SHOP",
  "SUPERMARKET",
  "CANTEEN",
  "OTHER",
] as const;
export type ProducerType = (typeof PRODUCER_TYPES)[number];

export const CATEGORIES = [
  "BREAD",
  "DAIRY",
  "MEAT",
  "PRODUCE",
  "READY_MEALS",
  "SWEETS",
  "DRINKS",
  "OTHER",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const CONDITIONS = [
  "SURPLUS",
  "BEST_BEFORE",
  "IMPERFECT",
  "LEFTOVER",
] as const;
export type Condition = (typeof CONDITIONS)[number];

export const LISTING_STATUSES = [
  "ACTIVE",
  "SOLD_OUT",
  "EXPIRED",
  "CANCELLED",
] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const RESERVATION_STATUSES = [
  "ACTIVE",
  "PICKED_UP",
  "CANCELLED",
  "NO_SHOW",
] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export const producerTypeLabel: Record<ProducerType, string> = {
  BAKERY: "Bäckerei",
  BUTCHER: "Metzgerei",
  RESTAURANT: "Restaurant",
  CAFE: "Café",
  FARM_SHOP: "Hofladen",
  SUPERMARKET: "Supermarkt",
  CANTEEN: "Kantine",
  OTHER: "Sonstiges",
};

export const categoryLabel: Record<Category, string> = {
  BREAD: "Brot & Backwaren",
  DAIRY: "Milchprodukte",
  MEAT: "Fleisch & Wurst",
  PRODUCE: "Obst & Gemüse",
  READY_MEALS: "Fertiggerichte",
  SWEETS: "Süßes",
  DRINKS: "Getränke",
  OTHER: "Sonstiges",
};

export const categoryEmoji: Record<Category, string> = {
  BREAD: "🍞",
  DAIRY: "🥛",
  MEAT: "🥩",
  PRODUCE: "🥬",
  READY_MEALS: "🍲",
  SWEETS: "🍰",
  DRINKS: "🧃",
  OTHER: "🧺",
};

export const conditionLabel: Record<Condition, string> = {
  SURPLUS: "Überproduktion",
  BEST_BEFORE: "MHD erreicht",
  IMPERFECT: "Optisch unperfekt",
  LEFTOVER: "Tagesreste",
};

export const conditionHint: Record<Condition, string> = {
  SURPLUS: "Noch frisch, nur zu viel produziert.",
  BEST_BEFORE: "Mindesthaltbarkeit erreicht – oft noch gut, selbst prüfen.",
  IMPERFECT: "Krumm, fleckig oder unförmig, aber essbar.",
  LEFTOVER: "Übrig vom heutigen Angebot, zeitnah abholen.",
};

export const listingStatusLabel: Record<ListingStatus, string> = {
  ACTIVE: "Verfügbar",
  SOLD_OUT: "Reserviert",
  EXPIRED: "Abgelaufen",
  CANCELLED: "Zurückgezogen",
};

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

export function isCondition(value: string): value is Condition {
  return (CONDITIONS as readonly string[]).includes(value);
}

export function isProducerType(value: string): value is ProducerType {
  return (PRODUCER_TYPES as readonly string[]).includes(value);
}

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}
