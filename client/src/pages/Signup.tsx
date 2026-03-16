import { NeonButton } from "@/components/ui/neon-button";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { BeamsBackground } from "@/components/ui/beams-background";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Send signup data — backend sends OTP email
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");

      // Step 2: Store pending data and redirect to OTP page
      sessionStorage.setItem("otpPending", JSON.stringify({
        email,
        type: "signup",
        name,
        password,
      }));
      setLocation(`/verify-otp${window.location.search}`);
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BeamsBackground className="flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <a className="inline-flex items-center gap-2 font-bold text-xl mb-6 smooth-transition hover:opacity-80">
              <img src="/logo.png" alt="LinkLite Logo" className="h-[112px] object-contain" />
            </a>
          </Link>
          <h1 className="text-3xl font-bold mb-2 text-white">Create Account</h1>
          <p className="text-gray-400">Join LinkLite and start shortening URLs</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-black/60 border border-white/10 shadow-2xl rounded-3xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-5 w-5 text-foreground/40" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#0000FF] smooth-transition"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-foreground/40" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#0000FF] smooth-transition"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-foreground/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#0000FF] smooth-transition"
                  required
                  minLength={6}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-foreground/40" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#0000FF] smooth-transition"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-white/40 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 rounded border-border cursor-pointer mt-0.5"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-400 cursor-pointer">
                I agree to the{" "}
                <a href="#" className="text-[#0000FF] dark:text-[#0000FF] hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#0000FF] dark:text-[#0000FF] hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            <NeonButton
              type="submit"
              variant="solid"
              className="w-full bg-[#0000FF] hover:bg-[#0000DD] text-white py-3 text-lg font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Creating account…" : "Create Account"}
              {!isLoading && <ArrowRight className="h-5 w-5" />}
            </NeonButton>
          </form>
        </motion.div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{" "}
          <Link href={`/login${window.location.search}`}>
            <a className="text-[#0000FF] dark:text-[#0000FF] font-medium hover:underline">
              Sign in
            </a>
          </Link>
        </p>
      </motion.div>
    </BeamsBackground>
  );
}
