import express from "express";
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

// Initialize external connections
connectDB().catch(console.error);
initRedis();

const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS
const corsOrigin = process.env.CORS_ORIGIN || "*";
app.use(
  cors({
    origin: corsOrigin === "*" ? true : corsOrigin.split(","),
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authLimiter, authRouter);
app.use("/api/links", apiLimiter, linksRouter);
app.use("/api/links", apiLimiter, qrRouter);
app.use("/api/analytics", apiLimiter, analyticsRouter);
app.use("/api/dashboard", apiLimiter, dashboardRouter);

app.use("/", redirectLimiter, redirectRouter);

export default app;
