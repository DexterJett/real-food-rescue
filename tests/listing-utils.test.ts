import { describe, expect, it } from "vitest";
import {
  discountPercent,
  eurosToCents,
  generatePickupCode,
  listingStatusFromCounts,
  remainingQuantity,
} from "../src/lib/listing-utils";

describe("remainingQuantity", () => {
  it("never goes below zero", () => {
    expect(remainingQuantity({ quantity: 3, reservedCount: 5 })).toBe(0);
  });

  it("subtracts reserved pieces", () => {
    expect(remainingQuantity({ quantity: 8, reservedCount: 3 })).toBe(5);
  });
});

describe("discountPercent", () => {
  it("rounds a typical rescue discount", () => {
    expect(discountPercent(800, 200)).toBe(75);
  });
});

describe("eurosToCents", () => {
  it("avoids floating point leftovers", () => {
    expect(eurosToCents(2.3)).toBe(230);
  });
});

describe("generatePickupCode", () => {
  it("creates a 4-character code from the alphabet", () => {
    const code = generatePickupCode(() => 0);
    expect(code).toHaveLength(4);
    expect(code).toBe("AAAA");
  });
});

describe("listingStatusFromCounts", () => {
  const pickupEnd = new Date("2026-08-24T20:00:00");

  it("marks sold out when everything is reserved", () => {
    expect(
      listingStatusFromCounts({
        reservedCount: 4,
        quantity: 4,
        pickupEnd,
        now: new Date("2026-08-24T12:00:00"),
      }),
    ).toBe("SOLD_OUT");
  });

  it("marks expired after the pickup window", () => {
    expect(
      listingStatusFromCounts({
        reservedCount: 1,
        quantity: 4,
        pickupEnd,
        now: new Date("2026-08-24T21:00:00"),
      }),
    ).toBe("EXPIRED");
  });
});
