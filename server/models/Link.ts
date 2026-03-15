import mongoose, { Document, Schema } from "mongoose";

export interface ILink extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  originalUrl: string;
  shortCode: string;
  customAlias?: string;
  title?: string;
  password?: string;
  expiresAt?: Date;
  isActive: boolean;
  totalClicks: number;
  createdAt: Date;
  updatedAt: Date;
}

const LinkSchema = new Schema<ILink>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    originalUrl: {
      type: String,
      required: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customAlias: {
      type: String,
      unique: true,
      sparse: true, // allows multiple nulls
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      trim: true,
    },
    password: {
      type: String, // stored as bcrypt hash
    },
    expiresAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalClicks: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// The code used for lookups is customAlias if set, otherwise shortCode
LinkSchema.virtual("slug").get(function () {
  return this.customAlias || this.shortCode;
});

export const Link = mongoose.model<ILink>("Link", LinkSchema);
