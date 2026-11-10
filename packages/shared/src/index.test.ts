import { describe, expect, it } from "vitest";
import { healthResponseSchema, VERIFICATION_STATUS, MIN_AGE } from "./index.js";

describe("shared", () => {
  it("validates a health payload", () => {
    const ok = healthResponseSchema.safeParse({
      status: "ok", service: "fitsewa-api", version: "0.0.0", time: new Date().toISOString()
    });
    expect(ok.success).toBe(true);
  });
  it("keeps the three verification states and 18+ minimum age", () => {
    expect(VERIFICATION_STATUS).toEqual(["draft", "estimated", "verified"]);
    expect(MIN_AGE).toBe(18);
  });
});
