import { describe, expect, it } from "vitest";
import {
  matchNotificationReasons,
  notificationCopy,
} from "../src/lib/notify";

describe("matchNotificationReasons", () => {
  it("notifies when the producer is followed", () => {
    expect(
      matchNotificationReasons({
        producerId: "baker-1",
        category: "BREAD",
        followedProducerIds: ["baker-1"],
        subscribedCategories: [],
      }),
    ).toEqual(["producer"]);
  });

  it("notifies when the category is subscribed", () => {
    expect(
      matchNotificationReasons({
        producerId: "baker-1",
        category: "DAIRY",
        followedProducerIds: [],
        subscribedCategories: ["DAIRY", "BREAD"],
      }),
    ).toEqual(["category"]);
  });

  it("returns both reasons when producer and product match", () => {
    expect(
      matchNotificationReasons({
        producerId: "baker-1",
        category: "BREAD",
        followedProducerIds: ["baker-1", "farm-1"],
        subscribedCategories: ["BREAD"],
      }),
    ).toEqual(["producer", "category"]);
  });

  it("does not notify for unrelated listings", () => {
    expect(
      matchNotificationReasons({
        producerId: "butcher-1",
        category: "MEAT",
        followedProducerIds: ["baker-1"],
        subscribedCategories: ["BREAD"],
      }),
    ).toEqual([]);
  });
});

describe("notificationCopy", () => {
  it("prefers the producer wording when both reasons match", () => {
    const copy = notificationCopy({
      reasons: ["producer", "category"],
      producerName: "Bäckerei Sonnenschein",
      listingTitle: "Körnerbrot",
      categoryLabel: "Brot & Backwaren",
    });
    expect(copy.title).toBe("Neu bei Bäckerei Sonnenschein");
    expect(copy.body).toContain("Körnerbrot");
  });

  it("marks MHD+ products in the body", () => {
    const copy = notificationCopy({
      reasons: ["category"],
      producerName: "Bio-Hofladen Müller",
      listingTitle: "Naturjoghurt",
      categoryLabel: "Milchprodukte",
      mhdPlus: true,
    });
    expect(copy.body).toContain("MHD+");
    expect(copy.body).toContain("vor Ort");
  });
});
