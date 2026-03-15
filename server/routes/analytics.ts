import { Router } from "express";
import { Link } from "../models/Link.js";
import { Click } from "../models/Click.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth);

// ── Overall stats for the authenticated user ──────────────────────────────────
analyticsRouter.get("/overview", async (req: AuthRequest, res) => {
  const links = await Link.find({ userId: req.userId }, "_id totalClicks createdAt");
  const linkIds = links.map((l) => l._id);

  const totalLinks = links.length;
  const totalClicks = links.reduce((sum, l) => sum + l.totalClicks, 0);

  // Clicks in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentClicks = await Click.countDocuments({
    linkId: { $in: linkIds },
    timestamp: { $gte: thirtyDaysAgo },
  });

  // Daily clicks for last 30 days
  const dailyClicks = await Click.aggregate([
    {
      $match: {
        linkId: { $in: linkIds },
        timestamp: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
        },
        clicks: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { date: "$_id", clicks: 1, _id: 0 } },
  ]);

  res.json({ totalLinks, totalClicks, recentClicks, dailyClicks });
});

// ── Per-link analytics ────────────────────────────────────────────────────────
analyticsRouter.get("/links/:id", async (req: AuthRequest, res) => {
  // Verify ownership
  const link = await Link.findOne({ _id: req.params.id, userId: req.userId });
  if (!link) {
    res.status(404).json({ error: "Link not found" });
    return;
  }

  const days = parseInt(req.query.days as string) || 30;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [dailyClicks, deviceBreakdown, browserBreakdown, osBreakdown, topReferrers] =
    await Promise.all([
      // Daily click timeline
      Click.aggregate([
        { $match: { linkId: link._id, timestamp: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            clicks: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { date: "$_id", clicks: 1, _id: 0 } },
      ]),

      // Device breakdown
      Click.aggregate([
        { $match: { linkId: link._id } },
        { $group: { _id: "$device", value: { $sum: 1 } } },
        { $project: { name: "$_id", value: 1, _id: 0 } },
      ]),

      // Browser breakdown
      Click.aggregate([
        { $match: { linkId: link._id } },
        { $group: { _id: "$browser", value: { $sum: 1 } } },
        { $sort: { value: -1 } },
        { $limit: 6 },
        { $project: { name: "$_id", value: 1, _id: 0 } },
      ]),

      // OS breakdown
      Click.aggregate([
        { $match: { linkId: link._id } },
        { $group: { _id: "$os", value: { $sum: 1 } } },
        { $sort: { value: -1 } },
        { $project: { name: "$_id", value: 1, _id: 0 } },
      ]),

      // Top referrers
      Click.aggregate([
        { $match: { linkId: link._id, referrer: { $exists: true, $ne: "" } } },
        { $group: { _id: "$referrer", clicks: { $sum: 1 } } },
        { $sort: { clicks: -1 } },
        { $limit: 5 },
        { $project: { referrer: "$_id", clicks: 1, _id: 0 } },
      ]),
    ]);

  res.json({
    link: {
      id: link._id,
      slug: link.customAlias || link.shortCode,
      originalUrl: link.originalUrl,
      title: link.title,
      totalClicks: link.totalClicks,
      createdAt: link.createdAt,
    },
    dailyClicks,
    deviceBreakdown,
    browserBreakdown,
    osBreakdown,
    topReferrers,
  });
});
