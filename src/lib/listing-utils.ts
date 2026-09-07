export function remainingQuantity(listing: {
  quantity: number;
  reservedCount: number;
}) {
  return Math.max(0, listing.quantity - listing.reservedCount);
}

export function discountPercent(originalCents: number, rescueCents: number) {
  if (originalCents <= 0) return 0;
  return Math.max(0, Math.round((1 - rescueCents / originalCents) * 100));
}

export function generatePickupCode(random: () => number = Math.random) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i += 1) {
    code += chars[Math.floor(random() * chars.length)];
  }
  return code;
}

export function moneyToCents(amount: number) {
  return Math.round(amount * 100);
}

export const eurosToCents = moneyToCents;

export function isMhdPlus(listing: { mhdPlus: boolean }) {
  return listing.mhdPlus;
}

export function listingStatusFromCounts(input: {
  reservedCount: number;
  quantity: number;
  pickupEnd: Date;
  now?: Date;
  cancelled?: boolean;
}) {
  if (input.cancelled) return "CANCELLED";
  const now = input.now ?? new Date();
  if (input.pickupEnd.getTime() <= now.getTime()) return "EXPIRED";
  if (input.reservedCount >= input.quantity) return "SOLD_OUT";
  return "ACTIVE";
}
