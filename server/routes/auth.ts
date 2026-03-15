import { Router } from "express";
import { z } from "zod";
import { User } from "../models/User.js";
import { Otp } from "../models/Otp.js";
import { requireAuth, signToken, type AuthRequest } from "../middleware/auth.js";
import { generateOtp, sendOtpEmail } from "../lib/mailer.js";

export const authRouter = Router();

const MAX_OTP_ATTEMPTS = 5;
const OTP_EXPIRY_MINUTES = 5;

// ── Signup (Step 1: Send OTP) ──────────────────────────────────────────────
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

  // Delete any existing OTPs for this email+type
  await Otp.deleteMany({ email, type: "signup" });

  const code = generateOtp();
  await Otp.create({
    email,
    code,
    type: "signup",
    expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
  });

  try {
    await sendOtpEmail(email, code, "signup");
  } catch (err: any) {
    console.error("[auth] Failed to send OTP email:", err.message);
    res.status(500).json({ error: "Failed to send verification email. Please try again." });
    return;
  }

  // Return pending state — do NOT create user yet
  res.json({ message: "OTP sent", email });
});

// ── Login (Step 1: Send OTP) ────────────────────────────────────────────────
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

  // Delete any existing OTPs for this email+type
  await Otp.deleteMany({ email, type: "login" });

  const code = generateOtp();
  await Otp.create({
    email,
    code,
    type: "login",
    expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
  });

  try {
    await sendOtpEmail(email, code, "login");
  } catch (err: any) {
    console.error("[auth] Failed to send OTP email:", err.message);
    res.status(500).json({ error: "Failed to send verification email. Please try again." });
    return;
  }

  // Return pending state — do NOT issue token yet
  res.json({ message: "OTP sent", email });
});

// ── Verify OTP (Step 2: Complete auth) ──────────────────────────────────────
const VerifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  type: z.enum(["signup", "login"]),
  // Signup fields (only needed for type=signup)
  name: z.string().min(2).max(50).optional(),
  password: z.string().min(6).max(100).optional(),
});

authRouter.post("/verify-otp", async (req, res) => {
  const result = VerifyOtpSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0].message });
    return;
  }

  const { email, code, type, name, password } = result.data;

  const otp = await Otp.findOne({ email, type }).sort({ createdAt: -1 });
  if (!otp) {
    res.status(400).json({ error: "No OTP found. Please request a new one." });
    return;
  }

  // Check expiry
  if (new Date() > otp.expiresAt) {
    await otp.deleteOne();
    res.status(400).json({ error: "OTP has expired. Please request a new one." });
    return;
  }

  // Check attempts
  if (otp.attempts >= MAX_OTP_ATTEMPTS) {
    await otp.deleteOne();
    res.status(429).json({ error: "Too many failed attempts. Please request a new OTP." });
    return;
  }

  // Verify code
  if (otp.code !== code) {
    otp.attempts += 1;
    await otp.save();
    res.status(400).json({ error: "Incorrect OTP code. Please try again." });
    return;
  }

  // OTP is valid — delete it
  await otp.deleteOne();

  if (type === "signup") {
    if (!name || !password) {
      res.status(400).json({ error: "Name and password are required for signup." });
      return;
    }

    // Double-check email isn't taken (race condition guard)
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ error: "Email already in use" });
      return;
    }

    const initRole = email.toLowerCase() === "rajmroy.17@gmail.com" ? "admin" : "user";
    const user = await User.create({ name, email, password, role: initRole });
    const token = signToken(user._id.toString());
    res.status(201).json({ token, user });
  } else {
    // Login — find user and issue token
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    if (user.status === "suspended") {
      res.status(403).json({ error: "Your account has been suspended by an administrator." });
      return;
    }

    const token = signToken(user._id.toString());
    res.json({ token, user });
  }
});

// ── Resend OTP ──────────────────────────────────────────────────────────────
const ResendOtpSchema = z.object({
  email: z.string().email(),
  type: z.enum(["signup", "login"]),
});

authRouter.post("/resend-otp", async (req, res) => {
  const result = ResendOtpSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0].message });
    return;
  }

  const { email, type } = result.data;

  // Rate limit: check if there's a recent OTP (created <60s ago)
  const recent = await Otp.findOne({
    email,
    type,
    createdAt: { $gt: new Date(Date.now() - 60 * 1000) },
  });

  if (recent) {
    res.status(429).json({ error: "Please wait before requesting a new OTP." });
    return;
  }

  // Delete old OTPs
  await Otp.deleteMany({ email, type });

  const code = generateOtp();
  await Otp.create({
    email,
    code,
    type,
    expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
  });

  try {
    await sendOtpEmail(email, code, type);
  } catch (err: any) {
    console.error("[auth] Failed to resend OTP email:", err.message);
    res.status(500).json({ error: "Failed to send verification email." });
    return;
  }

  res.json({ message: "OTP resent", email });
});

// ── Forgot Password (Step 1: Send OTP) ──────────────────────────────────────
const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

authRouter.post("/forgot-password", async (req, res) => {
  const result = ForgotPasswordSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0].message });
    return;
  }

  const { email } = result.data;

  const user = await User.findOne({ email });
  if (!user) {
    // Return success to prevent email enumeration, but do nothing
    res.json({ message: "If that email exists, a password reset code has been sent." });
    return;
  }

  // Clear existing reset OTPs
  await Otp.deleteMany({ email, type: "reset" });

  const code = generateOtp();
  await Otp.create({
    email,
    code,
    type: "reset",
    expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
  });

  try {
    await sendOtpEmail(email, code, "reset");
  } catch (err: any) {
    console.error("[auth] Failed to send reset OTP email:", err.message);
    res.status(500).json({ error: "Failed to send reset email. Please try again." });
    return;
  }

  res.json({ message: "Reset code sent", email });
});

// ── Reset Password (Step 2: Complete reset) ─────────────────────────────────
const ResetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(6).max(100),
});

authRouter.post("/reset-password", async (req, res) => {
  const result = ResetPasswordSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0].message });
    return;
  }

  const { email, code, newPassword } = result.data;

  const otp = await Otp.findOne({ email, type: "reset" }).sort({ createdAt: -1 });
  if (!otp) {
    res.status(400).json({ error: "No reset code found. Please request a new one." });
    return;
  }

  if (new Date() > otp.expiresAt) {
    await otp.deleteOne();
    res.status(400).json({ error: "Reset code has expired. Please request a new one." });
    return;
  }

  if (otp.attempts >= MAX_OTP_ATTEMPTS) {
    await otp.deleteOne();
    res.status(429).json({ error: "Too many failed attempts. Please request a new link." });
    return;
  }

  if (otp.code !== code) {
    otp.attempts += 1;
    await otp.save();
    res.status(400).json({ error: "Incorrect reset code. Please try again." });
    return;
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  // OTP valid: Delete it and update password
  await otp.deleteOne();
  
  user.password = newPassword;
  await user.save();

  res.json({ message: "Password reset successfully. You can now log in." });
});

// ── Get current user ─────────────────────────────────────────────────────────
authRouter.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  
  if (user.status === "suspended") {
    res.status(403).json({ error: "Your account has been suspended by an administrator." });
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
