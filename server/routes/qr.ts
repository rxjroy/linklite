import { Router } from "express";
import QRCode from "qrcode";
import { Link } from "../models/Link.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

export const qrRouter = Router();

qrRouter.use(requireAuth);

// ── Generate QR code for a link ─────────────────────────────────────────────
qrRouter.get("/:id/qr", async (req: AuthRequest, res) => {
  const link = await Link.findOne({ _id: req.params.id, userId: req.userId });
  if (!link) {
    res.status(404).json({ error: "Link not found" });
    return;
  }

  const slug = link.customAlias || link.shortCode;
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
  const shortUrl = `${baseUrl}/s/${slug}`;

  const size = parseInt(req.query.size as string) || 300;
  const format = (req.query.format as string) || "png";

  try {
    if (format === "svg") {
      const svg = await QRCode.toString(shortUrl, {
        type: "svg",
        width: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      res.setHeader("Content-Type", "image/svg+xml");
      res.send(svg);
    } else {
      // Default: PNG buffer
      const buffer = await QRCode.toBuffer(shortUrl, {
        type: "png",
        width: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Content-Disposition", `inline; filename="qr-${slug}.png"`);
      res.send(buffer);
    }
  } catch (err: any) {
    console.error("[qr] Generation error:", err);
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

// ── Get QR as data URL (for frontend embedding) ─────────────────────────────
qrRouter.get("/:id/qr/dataurl", async (req: AuthRequest, res) => {
  const link = await Link.findOne({ _id: req.params.id, userId: req.userId });
  if (!link) {
    res.status(404).json({ error: "Link not found" });
    return;
  }

  const slug = link.customAlias || link.shortCode;
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
  const shortUrl = `${baseUrl}/s/${slug}`;

  try {
    const dataUrl = await QRCode.toDataURL(shortUrl, {
      width: parseInt(req.query.size as string) || 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });
    res.json({ dataUrl, shortUrl });
  } catch (err: any) {
    console.error("[qr] DataURL generation error:", err);
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});
