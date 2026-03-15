import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Mail, ArrowRight, ShieldAlert, RefreshCw, ShieldCheck } from "lucide-react";
import { NeonButton } from "@/components/ui/neon-button";
import { BeamsBackground } from "@/components/ui/beams-background";
import { useAuth } from "@/contexts/AuthContext";

export default function VerifyOtp() {
  const [, setLocation] = useLocation();
  const { verifyOtp } = useAuth();

  // Get pending auth data from sessionStorage
  const pendingData = JSON.parse(sessionStorage.getItem("otpPending") || "{}");
  const email = pendingData.email || "";
  const type = pendingData.type || "login";
  const name = pendingData.name || "";
  const password = pendingData.password || "";

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no pending OTP data
  useEffect(() => {
    if (!email) {
      setLocation("/login");
    }
  }, [email, setLocation]);

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Mask email for display
  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_: string, a: string, b: string, c: string) => a + "*".repeat(b.length) + c)
    : "";

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only keep last digit
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (value && index === 5) {
      const code = newOtp.join("");
      if (code.length === 6) {
        handleSubmit(code);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData.length === 0) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus appropriate input
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();

    // Auto-submit if 6 digits pasted
    if (pastedData.length === 6) {
      handleSubmit(pastedData);
    }
  };

  const handleSubmit = async (code?: string) => {
    const otpCode = code || otp.join("");
    if (otpCode.length !== 6) return;

    setLoading(true);
    setError("");

    try {
      await verifyOtp(email, otpCode, type, name, password);
      sessionStorage.removeItem("otpPending");
      const params = new URLSearchParams(window.location.search);
      const urlParam = params.get("url");
      setLocation(urlParam ? `/dashboard?url=${encodeURIComponent(urlParam)}` : "/dashboard");
    } catch (err: any) {
      setError(err.message || "Verification failed");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;

    setResending(true);
    setError("");

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  if (!email) return null;

  return (
    <BeamsBackground className="flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="backdrop-blur-xl bg-black/40 border border-white/10 shadow-2xl rounded-3xl p-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              Verify Email
            </h1>
            <p className="text-gray-400 text-sm">
              We sent a 6-digit code to{" "}
              <span className="text-indigo-400 font-medium">{maskedEmail}</span>
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6"
            >
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          {/* OTP Inputs */}
          <div className="flex justify-center gap-3 mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={loading}
                className="w-12 h-14 text-center text-xl font-bold bg-secondary/30 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 disabled:opacity-50"
                autoFocus={index === 0}
              />
            ))}
          </div>

          {/* Submit Button */}
          <NeonButton
            type="button"
            onClick={() => handleSubmit()}
            disabled={loading || otp.join("").length !== 6}
            className="w-full h-12 gap-2 font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all mb-6"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Verify & Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </NeonButton>

          {/* Resend */}
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-2">Didn't receive the code?</p>
            <button
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          Secured by <span className="text-indigo-400 font-medium">LinkLite</span>
        </div>
      </motion.div>
    </BeamsBackground>
  );
}
