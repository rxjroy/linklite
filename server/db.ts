import mongoose from "mongoose";
import "dotenv/config";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/linklite";

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log("[db] Connected to MongoDB");
  } catch (err) {
    console.error("[db] Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}
