import nodemailer from "nodemailer";
import "dotenv/config";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Generate a random 6-digit OTP code.
 */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send an OTP verification email.
 */
export async function sendOtpEmail(
  email: string,
  code: string,
  type: "signup" | "login"
): Promise<void> {
  const subject =
    type === "signup"
      ? "Verify your LinkLite account"
      : "LinkLite login verification";

  const heading =
    type === "signup"
      ? "Welcome to LinkLite!"
      : "Login Verification";

  const message =
    type === "signup"
      ? "Use the code below to verify your email and complete your registration."
      : "Use the code below to verify your identity and log into your account.";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#0a0a0f;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <div style="max-width:480px;margin:40px auto;padding:0 20px;">
        <!-- Header -->
        <div style="text-align:center;padding:32px 0 24px;">
          <span style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
            ✦ link<span style="color:#818cf8;">lite</span>
          </span>
        </div>
        
        <!-- Card -->
        <div style="background:linear-gradient(145deg,#1a1a2e 0%,#16162a 100%);border:1px solid rgba(129,140,248,0.2);border-radius:20px;padding:40px 32px;text-align:center;">
          <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 8px;">${heading}</h1>
          <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 32px;">${message}</p>
          
          <!-- OTP Code -->
          <div style="background:rgba(129,140,248,0.1);border:1px solid rgba(129,140,248,0.3);border-radius:12px;padding:20px;margin:0 0 24px;">
            <span style="font-size:36px;font-weight:800;letter-spacing:12px;color:#818cf8;font-family:'Courier New',monospace;">
              ${code}
            </span>
          </div>
          
          <p style="color:#6b7280;font-size:12px;margin:0;">
            This code expires in <strong style="color:#f59e0b;">5 minutes</strong>.
            <br>If you didn't request this, you can safely ignore this email.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="text-align:center;padding:24px 0;">
          <p style="color:#4b5563;font-size:11px;margin:0;">
            Secured by <span style="color:#818cf8;">LinkLite</span> · Smart URL Shortener
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"LinkLite" <${process.env.SMTP_USER}>`,
    to: email,
    subject,
    html,
  });
}
