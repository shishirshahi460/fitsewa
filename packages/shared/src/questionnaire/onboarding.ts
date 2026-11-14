import { z } from "zod";

/** Version of the health-data consent text. Change it whenever the wording changes. */
export const CONSENT_TEXT_VERSION = "health-v1";
/** An unused draft is deleted this many days after its last change. */
export const DRAFT_TTL_DAYS = 7;

export const draftPatchSchema = z.object({
  step: z.number().int().min(0).max(300),
  answers: z.record(z.string(), z.unknown())
});

export const consentSchema = z.object({
  granted: z.boolean(),
  textVersion: z.string().min(1).max(40),
  locale: z.enum(["en", "ne"])
});