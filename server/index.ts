import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import cors from "cors";
import { connectDB } from "./db.js";
import { initRedis } from "./config/redis.js";
import { apiLimiter, authLimiter, redirectLimiter } from "./middleware/rateLimiter.js";
import { authRouter } from "./routes/auth.js";
import { linksRouter } from "./routes/links.js";
import { analyticsRouter } from "./routes/analytics.js";
import { redirectRouter } from "./routes/redirect.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { qrRouter } from "./routes/qr.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Connect to MongoDB first
  await connectDB();

  // Initialize Redis (graceful — works without it)
  initRedis();

  const app = express();
  const server = createServer(app);

  // ── Security headers ────────────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: false, // Let the frontend handle CSP
      crossOriginEmbedderPolicy: false,
    })
  );

  // ── CORS ────────────────────────────────────────────────────────────────────
  const corsOrigin = process.env.CORS_ORIGIN || "*";
  app.use(
    cors({
      origin: corsOrigin === "*" ? true : corsOrigin.split(","),
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // ── Body parsing ────────────────────────────────────────────────────────────
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  // ── Health check ────────────────────────────────────────────────────────────
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ── API Routes ──────────────────────────────────────────────────────────────
  app.use("/api/auth", authLimiter, authRouter);
  app.use("/api/links", apiLimiter, linksRouter);
  app.use("/api/links", apiLimiter, qrRouter); // QR routes nested under /api/links/:id/qr
  app.use("/api/analytics", apiLimiter, analyticsRouter);
  app.use("/api/dashboard", apiLimiter, dashboardRouter);

  // ── Short URL redirects ─────────────────────────────────────────────────────
  // Must come AFTER /api routes so it doesn't swallow them
  // Mounted at root so short links work directly: domain.com/slug (like bit.ly)
  app.use("/", redirectLimiter, redirectRouter);

  // ── Static files (production only) ──────────────────────────────────────────
  if (process.env.NODE_ENV === "production") {
    const staticPath = path.resolve(__dirname, "..", "dist", "public");

    app.use(express.static(staticPath));

    // SPA fallback
    app.get("*", (_req, res) => {
      res.sendFile(path.join(staticPath, "index.html"));
    });
  }

  // ── Start ───────────────────────────────────────────────────────────────────
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`[server] Running on http://localhost:${port}`);
    console.log(`[server] API available at http://localhost:${port}/api`);
    console.log(`[server] BASE_URL: ${process.env.BASE_URL || "(not set — using request host)"}`);
  });
}

startServer().catch((err) => {
  console.error("[server] Fatal error:", err);
  process.exit(1);
});
