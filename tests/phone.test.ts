import { describe, expect, it } from "vitest";
import { normalizePhone } from "../src/lib/phone";

describe("normalizePhone", () => {
  it("accepts a Liechtenstein number with spaces", () => {
    expect(normalizePhone("+423 234 56 78")).toBe("+4232345678");
  });

  it("accepts a local 7-digit Liechtenstein number", () => {
    expect(normalizePhone("2345678")).toBe("+4232345678");
  });

  it("rejects too-short numbers", () => {
    expect(normalizePhone("123")).toBeNull();
  });
});
