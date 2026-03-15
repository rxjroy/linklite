import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.js";
import { User } from "../models/User.js";

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ error: "Forbidden: Account suspended" });
    }

    // Attach user document to req.user for downstream admin routes if needed
    (req as any).adminUser = user;
    next();
  } catch (error) {
    console.error("RequireAdmin error:", error);
    res.status(500).json({ error: "Server error during authorization" });
  }
};
