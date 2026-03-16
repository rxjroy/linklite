import { useState } from "react";
import { useRoute } from "wouter";
import { motion } from "framer-motion";
import { Lock, ArrowRight, ShieldAlert } from "lucide-react";
import { NeonButton } from "@/components/ui/neon-button";
import { api } from "@/lib/api";

export default function PasswordUnlock() {
  const [, params] = useRoute("/p/:slug");
  const slug = params?.slug || "";

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/links/verify/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Incorrect password");
      }

      if (data.originalUrl) {
        // Redirect directly to the target URL
        window.location.href = data.originalUrl;
      } else {
        setError("Invalid response from server.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Incorrect password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0000FF]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl bg-background/40">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#0000FF]/20 border border-[#0000FF]/30 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-[#0000FF]" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Protected Link</h1>
            <p className="text-gray-400 text-sm">
              This link is password protected. Please enter the password to continue to the destination.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            <div className="space-y-2">
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  required
                  disabled={loading}
                  className="w-full px-4 py-3.5 bg-secondary/30 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0000FF]/50 focus:border-[#0000FF]/50 transition-all duration-300"
                />
              </div>
            </div>

            <NeonButton
              type="submit"
              disabled={loading || !password}
              className="w-full h-12 gap-2 font-medium bg-[#0000FF] hover:bg-[#0000DD] text-white rounded-xl shadow-[0_0_20px_rgba(0,0,255,0.3)] hover:shadow-[0_0_30px_rgba(0,0,255,0.5)] transition-all"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Unlock Link
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </NeonButton>
          </form>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          Secured by <span className="text-[#0000FF] font-medium">LinkLite</span>
        </div>
      </motion.div>
    </div>
  );
}
