import { Router } from "express";
import { Link } from "../models/Link.js";
import { Click } from "../models/Click.js";
import { parseUserAgent } from "../lib/ua.js";
import { getCache, setCache } from "../config/redis.js";

export const redirectRouter = Router();

// ── Main redirect handler ─────────────────────────────────────────────────────
redirectRouter.get("/:slug", async (req, res) => {
  const { slug } = req.params;

  // ── Step 1: Try Redis cache ───────────────────────────────────────────────
  const cacheKey = `redirect:${slug}`;
  const cached = await getCache(cacheKey);

  if (cached) {
    try {
      const data = JSON.parse(cached);

      // Still need to re-validate expiry from cached data
      if (data.expiresAt && new Date() > new Date(data.expiresAt)) {
        res.status(410).json({ error: "This link has expired" });
        return;
      }

      if (data.hasPassword) {
        // Redirect to frontend password unlock page natively relative to the request port
        res.redirect(`/p/${slug}`);
        return;
      }

      // Log click asynchronously
      logClick(data.linkId, req).catch(console.error);
      Link.findByIdAndUpdate(data.linkId, { $inc: { totalClicks: 1 } }).catch(console.error);

      res.redirect(301, data.originalUrl);
      return;
    } catch {
      // Cache data corrupt, fall through to DB
    }
  }

  // ── Step 2: Database lookup ───────────────────────────────────────────────
  const link = await Link.findOne({
    $or: [{ shortCode: slug }, { customAlias: slug }],
  });

  if (!link) {
    res.status(404).json({ error: "Link not found" });
    return;
  }

  // Check active
  if (!link.isActive) {
    res.status(410).json({ error: "This link has been deactivated" });
    return;
  }

  // Check expiry
  if (link.expiresAt && new Date() > link.expiresAt) {
    res.status(410).json({ error: "This link has expired" });
    return;
  }

  // ── Step 3: Cache the result for next time (1 hour TTL) ───────────────────
  const cacheValue = JSON.stringify({
    linkId: link._id.toString(),
    originalUrl: link.originalUrl,
    hasPassword: !!link.password,
    isActive: link.isActive,
    expiresAt: link.expiresAt?.toISOString() || null,
  });
  setCache(cacheKey, cacheValue, 3600).catch(console.error);

  // If password protected, redirect to frontend password unlock page
  if (link.password) {
    res.redirect(`/p/${slug}`);
    return;
  }

  // Log click asynchronously (don't block redirect)
  logClick(link._id.toString(), req).catch(console.error);

  // Increment click counter
  Link.findByIdAndUpdate(link._id, { $inc: { totalClicks: 1 } }).catch(console.error);

  res.redirect(301, link.originalUrl);
});

// ── Analytics logging ─────────────────────────────────────────────────────────
async function logClick(linkId: string, req: any) {
  const ua = req.headers["user-agent"] || "";
  const { device, browser, os } = parseUserAgent(ua);

  const referrer = req.headers["referer"] || req.headers["referrer"] || "";

  // Get IP - handle proxies
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "";

  await Click.create({
    linkId,
    ip: ip || undefined,
    device,
    browser,
    os,
    referrer: referrer || undefined,
    userAgent: ua || undefined,
  });
}
