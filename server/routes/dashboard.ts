import { Router } from "express";
import { Link } from "../models/Link.js";
import { Click } from "../models/Click.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

// ── Dashboard overview stats ────────────────────────────────────────────────
dashboardRouter.get("/stats", async (req: AuthRequest, res) => {
  const userId = req.userId;

  const [totalLinks, activeLinks, expiredLinks, totalClicks, recentLinks] =
    await Promise.all([
      // Total links
      Link.countDocuments({ userId }),

      // Active links (not expired, isActive = true)
      Link.countDocuments({
        userId,
        isActive: true,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } },
        ],
      }),

      // Expired links
      Link.countDocuments({
        userId,
        $or: [
          { isActive: false },
          { expiresAt: { $lte: new Date() } },
        ],
      }),

      // Total clicks across all user's links
      Link.aggregate([
        { $match: { userId: { $eq: userId } } },
        { $group: { _id: null, total: { $sum: "$totalClicks" } } },
      ]).then((result) => result[0]?.total || 0),

      // Recent 5 links
      Link.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("shortCode customAlias title originalUrl totalClicks createdAt isActive expiresAt")
        .lean(),
    ]);

  // Format recent links
  const formattedRecent = recentLinks.map((link: any) => ({
    _id: link._id,
    slug: link.customAlias || link.shortCode,
    title: link.title,
    originalUrl: link.originalUrl,
    totalClicks: link.totalClicks,
    createdAt: link.createdAt,
    isActive: link.isActive,
    isExpired: link.expiresAt ? new Date() > link.expiresAt : false,
  }));

  res.json({
    totalLinks,
    totalClicks,
    activeLinks,
    expiredLinks,
    recentLinks: formattedRecent,
  });
});
