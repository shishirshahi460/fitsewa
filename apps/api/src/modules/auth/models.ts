import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { USER_ROLES } from "@fitsewa/shared";

mongoose.set("bufferCommands", false); // fail fast instead of hanging when the DB is unreachable

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, default: "user" },
    dateOfBirth: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    termsAcceptedAt: { type: Date, required: true }
  },
  { timestamps: true }
);

const sessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    revokedAt: { type: Date },
    userAgent: { type: String, maxlength: 300 }
  },
  { timestamps: true }
);

const auditSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, index: true },
    action: { type: String, required: true },
    ip: { type: String },
    meta: { type: Schema.Types.Mixed }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const emailTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["verify", "reset"], required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    usedAt: { type: Date }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const User = mongoose.model("User", userSchema);
export const Session = mongoose.model("Session", sessionSchema);
export const EmailToken = mongoose.model("EmailToken", emailTokenSchema);
export const AuditLog = mongoose.model("AuditLog", auditSchema);
export type UserDoc = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId; createdAt: Date };