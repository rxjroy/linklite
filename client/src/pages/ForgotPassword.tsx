import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Mail, Lock, ShieldCheck, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { NeonButton } from "@/components/ui/neon-button";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await api.auth.forgotPassword(email);
      setStep("otp");
      setSuccessMsg("We've sent a 6-digit code to your email.");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }
    setError("");
    setSuccessMsg("");
    setStep("password");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await api.auth.resetPassword(email, otp, newPassword);
      setSuccessMsg("Password reset successfully! Redirecting...");
      setTimeout(() => {
        setLocation("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Invalid or expired code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
      position: "absolute" as const,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      position: "relative" as const,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
      position: "absolute" as const,
    })
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative overflow-hidden bg-background">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#0000FF]/20 blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#0000FF]/10 blur-[150px] pointer-events-none mix-blend-screen" />

      {/* Left Column - Form */}
      <div className="flex items-center justify-center p-8 sm:p-12 relative z-10 w-full max-w-xl mx-auto lg:max-w-none">
        <div className="w-full max-w-[440px] relative">
          
          <div className="mb-8">
            <Link href="/">
              <div className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors cursor-pointer group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back to Home</span>
              </div>
            </Link>
            <h1 className="text-4xl font-bold text-white tracking-tight mb-3">Forgot Password?</h1>
            <p className="text-white/60 text-lg">
              {step === "email" && "Let's get you back into your account."}
              {step === "otp" && "Check your inbox for a reset code."}
              {step === "password" && "Secure your account with a new password."}
            </p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          {successMsg && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="relative">
            <AnimatePresence initial={false} mode="wait" custom={step === "email" ? -1 : 1}>
              
              {step === "email" && (
                <motion.form
                  key="email"
                  custom={-1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  onSubmit={handleRequestOtp}
                  className="space-y-5 w-full"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 block">Email Address</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-[#0000FF] transition-colors">
                        <Mail className="h-5 w-5" />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all backdrop-blur-sm"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <NeonButton
                    type="submit"
                    variant="solid"
                    className="w-full mt-2 bg-[#0000FF] hover:bg-[#0000DD] h-[52px]"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending Code..." : "Send Reset Code"} <ArrowRight className="ml-2 h-4 w-4 inline" />
                  </NeonButton>
                </motion.form>
              )}

              {step === "otp" && (
                <motion.form
                  key="otp"
                  custom={1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  onSubmit={handleVerifyOtp}
                  className="space-y-5 w-full"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 block">
                      6-Digit Code sent to {email}
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-[#0000FF] transition-colors">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 tracking-[0.5em] text-center text-lg focus:outline-none focus:ring-2 focus:ring-[#0000FF]/50 focus:bg-white/10 transition-all backdrop-blur-sm font-mono"
                      />
                    </div>
                  </div>

                  <NeonButton
                    type="submit"
                    variant="solid"
                    className="w-full mt-2 bg-[#0000FF] hover:bg-[#0000DD] h-[52px]"
                    disabled={otp.length !== 6}
                  >
                    Verify Code <ArrowRight className="ml-2 h-4 w-4 inline" />
                  </NeonButton>
                </motion.form>
              )}

              {step === "password" && (
                <motion.form
                  key="password"
                  custom={1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  onSubmit={handleResetPassword}
                  className="space-y-5 w-full"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 block">New Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-[#0000FF] transition-colors">
                        <Lock className="h-5 w-5" />
                      </div>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all backdrop-blur-sm"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <NeonButton
                    type="submit"
                    variant="solid"
                    className="w-full mt-2 bg-[#0000FF] hover:bg-[#0000DD] h-[52px]"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Reset Password"} <ArrowRight className="ml-2 h-4 w-4 inline" />
                  </NeonButton>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 text-center">
            <p className="text-white/50 text-sm">
              Remembered your password?{" "}
              <Link href="/login">
                <span className="text-[#0000FF] hover:text-[#0000DD] font-medium cursor-pointer transition-colors">
                  Sign in instead
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Decorative */}
      <div className="hidden lg:flex relative bg-gradient-to-br from-[#0000FF]/40 via-[#0a0a0f] to-[#0000AA]/20 border-l border-white/5 items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        
        <div className="relative z-10 w-full max-w-lg text-center">
          <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#0000FF]/10 border border-[#0000FF]/20 shadow-[0_0_40px_rgba(0,0,255,0.2)]">
            <Lock className="w-10 h-10 text-[#0000FF]" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            Seamless Recovery
          </h2>
          <p className="text-white/60 text-lg leading-relaxed">
            Verify your identity with our secure OTP mechanism and restore access to your LinkLite workspace in seconds.
          </p>
        </div>
      </div>
    </div>
  );
}
