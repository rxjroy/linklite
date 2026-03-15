import { Router } from "express";
import { z } from "zod";
import { User } from "../models/User.js";
import { requireAuth, signToken, type AuthRequest } from "../middleware/auth.js";

export const authRouter = Router();

// ── Signup ──────────────────────────────────────────────────────────────────
const SignupSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

authRouter.post("/signup", async (req, res) => {
  const result = SignupSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0].message });
    return;
  }

  const { name, email, password } = result.data;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }

  const user = await User.create({ name, email, password });
  const token = signToken(user._id.toString());

  res.status(201).json({ token, user });
});

// ── Login ────────────────────────────────────────────────────────────────────
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/login", async (req, res) => {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0].message });
    return;
  }

  const { email, password } = result.data;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken(user._id.toString());
  res.json({ token, user });
});

// ── Get current user ─────────────────────────────────────────────────────────
authRouter.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ user });
});

// ── Update profile ────────────────────────────────────────────────────────────
const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).max(100).optional(),
});

authRouter.patch("/me", requireAuth, async (req: AuthRequest, res) => {
  const result = UpdateProfileSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0].message });
    return;
  }

  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const { name, currentPassword, newPassword } = result.data;

  if (name) user.name = name;

  if (newPassword) {
    if (!currentPassword) {
      res.status(400).json({ error: "Current password required to set new password" });
      return;
    }
    const valid = await user.comparePassword(currentPassword);
    if (!valid) {
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }
    user.password = newPassword;
  }

  await user.save();
  res.json({ user });
});
