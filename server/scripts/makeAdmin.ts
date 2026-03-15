import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/linklite";

const userSchema = new mongoose.Schema({ email: String, role: String }, { strict: false });
const User = mongoose.model("User", userSchema);

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to DB");
    
    const result = await User.updateOne(
      { email: "rajmroy.17@gmail.com" },
      { $set: { role: "admin" } }
    );
    
    console.log("Update result:", result);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
