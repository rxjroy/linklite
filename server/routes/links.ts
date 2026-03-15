import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Link } from "../models/Link.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { generateShortCode, isValidAlias, isReservedAlias } from "../lib/shortcode.js";
import { deleteCache } from "../config/redis.js";

// ── URL safety check ──────────────────────────────────────────────────────────
const BLOCKED_PROTOCOLS = ["javascript:", "data:", "vbscript:", "file:"];
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const protocol = parsed.protocol.toLowerCase();
    return !BLOCKED_PROTOCOLS.some((p) => protocol.startsWith(p));
  } catch {
    return false;
  }
}

export const linksRouter = Router();

// ── Public: Password-protected link verification ──────────────────────────────
// This endpoint does NOT require auth (visitors need to verify passwords)
linksRouter.post("/verify/:slug", async (req, res) => {
  const { slug } = req.params;
  const { password } = req.body;

  const link = await Link.findOne({
    $or: [{ shortCode: slug }, { customAlias: slug }],
    isActive: true,
  });

  if (!link || !link.password) {
    res.status(404).json({ error: "Link not found" });
    return;
  }

  const valid = await bcrypt.compare(password, link.password);
  if (!valid) {
    res.status(401).json({ error: "Incorrect password" });
    return;
  }

  res.json({ originalUrl: link.originalUrl });
});

// All remaining link routes require auth
linksRouter.use(requireAuth);

// ── Create a short link ───────────────────────────────────────────────────────
const CreateLinkSchema = z.object({
  originalUrl: z.string().url("Please enter a valid URL"),
  customAlias: z.string().optional(),
  title: z.string().max(100).optional(),
  password: z.string().min(4).optional(),
  expiresAt: z.string().datetime().optional(),
});

linksRouter.post("/", async (req: AuthRequest, res) => {
  const result = CreateLinkSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0].message });
    return;
  }

  // Block dangerous URL schemes
  if (!isSafeUrl(result.data.originalUrl)) {
    res.status(400).json({ error: "This URL is not allowed" });
    return;
  }

  const { originalUrl, customAlias, title, password, expiresAt } = result.data;

  // Validate custom alias
  if (customAlias) {
    if (!isValidAlias(customAlias)) {
      res.status(400).json({ error: "Alias must be 3–30 lowercase letters, numbers, or hyphens" });
      return;
    }
    if (isReservedAlias(customAlias)) {
      res.status(400).json({ error: "This alias is reserved, please choose another" });
      return;
    }
    const existing = await Link.findOne({ customAlias });
    if (existing) {
      res.status(409).json({ error: "This custom alias is already taken" });
      return;
    }
  }

  const shortCode = await generateShortCode();
  const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

  const link = await Link.create({
    userId: req.userId,
    originalUrl,
    shortCode,
    customAlias: customAlias || undefined,
    title: title || undefined,
    password: hashedPassword,
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
  });

  res.status(201).json({ link: sanitizeLink(link) });
});

// ── List user's links ─────────────────────────────────────────────────────────
linksRouter.get("/", async (req: AuthRequest, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const skip = (page - 1) * limit;

  const [links, total] = await Promise.all([
    Link.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Link.countDocuments({ userId: req.userId }),
  ]);

  res.json({
    links: links.map(sanitizeLink),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// ── Get a single link ─────────────────────────────────────────────────────────
linksRouter.get("/:id", async (req: AuthRequest, res) => {
  const link = await Link.findOne({ _id: req.params.id, userId: req.userId });
  if (!link) {
    res.status(404).json({ error: "Link not found" });
    return;
  }
  res.json({ link: sanitizeLink(link) });
});

// ── Update a link ─────────────────────────────────────────────────────────────
const UpdateLinkSchema = z.object({
  title: z.string().max(100).optional(),
  originalUrl: z.string().url().optional(),
  customAlias: z.string().nullable().optional(),
  password: z.string().min(4).nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  isActive: z.boolean().optional(),
});

linksRouter.patch("/:id", async (req: AuthRequest, res) => {
  const result = UpdateLinkSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0].message });
    return;
  }

  const link = await Link.findOne({ _id: req.params.id, userId: req.userId });
  if (!link) {
    res.status(404).json({ error: "Link not found" });
    return;
  }

  const { title, originalUrl, customAlias, password, expiresAt, isActive } = result.data;

  if (title !== undefined) link.title = title;
  if (originalUrl !== undefined) link.originalUrl = originalUrl;
  if (isActive !== undefined) link.isActive = isActive;
  if (expiresAt !== undefined) link.expiresAt = expiresAt ? new Date(expiresAt) : undefined;

  if (customAlias !== undefined) {
    if (customAlias === null) {
      link.customAlias = undefined;
    } else {
      if (!isValidAlias(customAlias)) {
        res.status(400).json({ error: "Invalid alias format" });
        return;
      }
      const existing = await Link.findOne({ customAlias, _id: { $ne: link._id } });
      if (existing) {
        res.status(409).json({ error: "This alias is already taken" });
        return;
      }
      link.customAlias = customAlias;
    }
  }

  if (password !== undefined) {
    link.password = password ? await bcrypt.hash(password, 10) : undefined;
  }

  await link.save();

  // Invalidate Redis cache for all possible slugs
  if (link.shortCode) deleteCache(`redirect:${link.shortCode}`).catch(console.error);
  if (link.customAlias) deleteCache(`redirect:${link.customAlias}`).catch(console.error);

  res.json({ link: sanitizeLink(link) });
});

// ── Delete a link ─────────────────────────────────────────────────────────────
linksRouter.delete("/:id", async (req: AuthRequest, res) => {
  const link = await Link.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!link) {
    res.status(404).json({ error: "Link not found" });
    return;
  }

  // Invalidate Redis cache
  deleteCache(`redirect:${link.shortCode}`).catch(console.error);
  if (link.customAlias) deleteCache(`redirect:${link.customAlias}`).catch(console.error);

  res.json({ message: "Link deleted" });
});

// ── Helper: strip password hash from response ─────────────────────────────────
function sanitizeLink(link: any) {
  const obj = link.toObject ? link.toObject() : link;
  const { password, ...safe } = obj;
  return {
    ...safe,
    slug: link.customAlias || link.shortCode,
    hasPassword: !!password,
  };
}
