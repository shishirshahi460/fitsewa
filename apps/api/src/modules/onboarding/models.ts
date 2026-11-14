import mongoose, { Schema } from "mongoose";

const draftSchema = new Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    questionnaireVersion: { type: String, required: true },
    step: { type: Number, default: 0 },
    consentHealth: { type: Boolean, default: null },
    answers: { type: Schema.Types.Mixed, default: {} }, // lower-sensitivity answers
    sensitiveEnc: { type: String }, // body, allergy, health and identity answers, encrypted
    expiresAt: { type: Date, required: true, index: { expires: 0 } }
  },
  { timestamps: true }
);

const consentSchema = new Schema(
  {
    draftId: { type: Schema.Types.ObjectId, index: true },
    userId: { type: Schema.Types.ObjectId, index: true },
    purpose: { type: String, enum: ["health_data", "marketing_email", "terms"], required: true },
    textVersion: { type: String, required: true },
    granted: { type: Boolean, required: true },
    locale: { type: String, enum: ["en", "ne"] },
    expiresAt: { type: Date, index: { expires: 0 } } // draft-only records are cleaned up automatically
  },
  { timestamps: true }
);

export const OnboardingDraft = mongoose.model("OnboardingDraft", draftSchema);
export const Consent = mongoose.model("Consent", consentSchema);