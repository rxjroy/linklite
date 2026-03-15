import mongoose, { Document, Schema } from "mongoose";

export interface IOtp extends Document {
  email: string;
  code: string;
  type: "signup" | "login" | "reset";
  attempts: number;
  expiresAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["signup", "login", "reset"],
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL: auto-delete when expiresAt is reached
    },
  },
  { timestamps: true }
);

// Compound index for efficient lookups
OtpSchema.index({ email: 1, type: 1 });

export const Otp = mongoose.model<IOtp>("Otp", OtpSchema);
