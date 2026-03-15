import mongoose, { Document, Schema } from "mongoose";

export interface IClick extends Document {
  _id: mongoose.Types.ObjectId;
  linkId: mongoose.Types.ObjectId;
  timestamp: Date;
  ip?: string;
  country?: string;
  city?: string;
  device: "desktop" | "mobile" | "tablet" | "unknown";
  browser: string;
  os: string;
  referrer?: string;
  userAgent?: string;
}

const ClickSchema = new Schema<IClick>(
  {
    linkId: {
      type: Schema.Types.ObjectId,
      ref: "Link",
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    ip: String,
    country: String,
    city: String,
    device: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "unknown"],
      default: "unknown",
    },
    browser: {
      type: String,
      default: "Unknown",
    },
    os: {
      type: String,
      default: "Unknown",
    },
    referrer: String,
    userAgent: String,
  },
  {
    // No updatedAt needed for immutable click events
    timestamps: { createdAt: "timestamp", updatedAt: false },
  }
);

export const Click = mongoose.model<IClick>("Click", ClickSchema);
