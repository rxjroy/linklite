import app from "./app.js";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = createServer(app);

// ── Static files (production only) ──────────────────────────────────────────
if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
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
