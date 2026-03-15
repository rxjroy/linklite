import { Router, Response } from "express";
import { User } from "../models/User.js";
import { Link } from "../models/Link.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import { z } from "zod";

export const adminRouter = Router();

// Strongly type and bind middlewares to all routes under /api/admin
adminRouter.use(requireAuth, requireAdmin as any);

// ── GET /api/admin/stats ──────────────────────────────────────────────────────────
adminRouter.get("/stats", async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLinks = await Link.countDocuments();
    
    // Sum all totalClicks across all links
    const clicksAggregation = await Link.aggregate([
      { $group: { _id: null, totalPlatformClicks: { $sum: "$totalClicks" } } }
    ]);
    const totalClicks = clicksAggregation.length > 0 ? clicksAggregation[0].totalPlatformClicks : 0;

    res.json({
      totalUsers,
      totalLinks,
      totalClicks,
    });
  } catch (error) {
    console.error("[admin] Fail to fetch stats:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ── GET /api/admin/users ────────────────────────────────────────────────────────
adminRouter.get("/users", async (req: AuthRequest, res: Response) => {
  try {
    // Return all users, along with their link counts
    const users = await User.aggregate([
      {
        $lookup: {
          from: "links",
          localField: "_id",
          foreignField: "userId",
          as: "linksData",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          role: 1,
          status: 1,
          createdAt: 1,
          linkCount: { $size: "$linksData" },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    res.json({ users });
  } catch (error) {
    console.error("[admin] Fail to fetch users:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ── GET /api/admin/users/:id/links ──────────────────────────────────────────────
adminRouter.get("/users/:id/links", async (req: AuthRequest, res: Response) => {
  try {
    const links = await Link.find({ userId: req.params.id }).sort({ createdAt: -1 });
    res.json({ links });
  } catch (error) {
    console.error("[admin] Fail to fetch user links:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ── PATCH /api/admin/users/:id/status ───────────────────────────────────────────
const StatusSchema = z.object({
  status: z.enum(["active", "suspended"]),
});

adminRouter.patch("/users/:id/status", async (req: AuthRequest, res: Response) => {
  const result = StatusSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role === "admin" && user._id.toString() === req.userId) {
       return res.status(400).json({ error: "You cannot suspend yourself." });
    }

    user.status = result.data.status;
    await user.save();

    res.json({ message: `User status changed to ${user.status}`, user: { _id: user._id, status: user.status } });
  } catch (error) {
    console.error("[admin] Fail to change user status:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ── PATCH /api/admin/links/:id/status ───────────────────────────────────────────
const LinkStatusSchema = z.object({
  status: z.enum(["active", "disabled"]),
});

adminRouter.patch("/links/:id/status", async (req: AuthRequest, res: Response) => {
  const result = LinkStatusSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message });
  }

  try {
    const link = await Link.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    link.status = result.data.status;
    await link.save();

    res.json({ message: `Link status changed to ${link.status}`, link: { _id: link._id, status: link.status } });
  } catch (error) {
    console.error("[admin] Fail to change link status:", error);
    res.status(500).json({ error: "Server error" });
  }
});
