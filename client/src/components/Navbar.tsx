import { HoverButton } from "@/components/ui/hover-button";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollProgress } from "@/components/ui/scroll-progress";

/**
 * Navbar Component
 * 
 * Design Philosophy: Minimal, clean navigation
 * - Sticky positioning for accessibility
 * - Logo with gradient accent
 * - Responsive mobile menu
 * - Auth-aware: shows login/signup for guests, Dashboard for logged-in users
 */

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl"
    >
      <ScrollProgress className="absolute top-0 bg-[#0000FF]" />
      <div className="container relative flex items-center justify-between h-16 sm:h-20 px-4">
        {/* Logo */}
        <span
          className="flex items-center gap-2 font-bold text-xl smooth-transition hover:opacity-80 cursor-pointer z-10"
          onClick={() => { setLocation("/"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        >
          <img src="/logo.png" alt="LinkLite Logo" className="h-12 sm:h-[72px] object-contain" />
        </span>

        {/* Desktop Navigation — Centered */}
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <span
            className="text-sm text-gray-400 hover:text-white smooth-transition cursor-pointer"
            onClick={() => { setLocation("/"); setTimeout(() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }), 100); }}
          >
            Features
          </span>
          <span
            className="text-sm text-gray-400 hover:text-white smooth-transition cursor-pointer"
            onClick={() => { setLocation("/"); setTimeout(() => document.getElementById("testimonials")?.scrollIntoView({ behavior: "smooth" }), 100); }}
          >
            Testimonials
          </span>
        </div>

        {/* Auth Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {isAuthenticated ? (
            <HoverButton
              className="gap-2 bg-[#0000FF] hover:bg-[#0000DD] px-6"
              onClick={() => setLocation("/dashboard")}
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              Dashboard
            </HoverButton>
          ) : (
            <>
              <Link href="/login">
                <HoverButton
                  className="bg-black hover:bg-black text-white border border-white/20 px-4"
                  style={{ "--circle-start": "#374151", "--circle-end": "#6B7280" } as React.CSSProperties}
                >
                  Sign In
                </HoverButton>
              </Link>
              <Link href="/signup">
                <HoverButton className="px-6 relative overflow-hidden">
                  Get Started
                </HoverButton>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 hover:bg-secondary rounded-lg smooth-transition"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {
        mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-t border-border bg-background"
          >
            <div className="container py-4 space-y-3">
              <span
                className="block text-sm text-gray-400 hover:text-white py-2 cursor-pointer"
                onClick={() => { setMobileMenuOpen(false); setLocation("/"); setTimeout(() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }), 100); }}
              >
                Features
              </span>
              <span
                className="block text-sm text-gray-400 hover:text-white py-2 cursor-pointer"
                onClick={() => { setMobileMenuOpen(false); setLocation("/"); setTimeout(() => document.getElementById("testimonials")?.scrollIntoView({ behavior: "smooth" }), 100); }}
              >
                Testimonials
              </span>
              {isAuthenticated && (
                <>
                  <Link href="/dashboard">
                    <span className="block text-sm text-gray-400 hover:text-white py-2 cursor-pointer">
                      Dashboard
                    </span>
                  </Link>
                  <Link href="/analytics">
                    <span className="block text-sm text-gray-400 hover:text-white py-2 cursor-pointer">
                      Analytics
                    </span>
                  </Link>
                </>
              )}
              <div className="pt-3 space-y-2 border-t border-border flex flex-col items-center">
                {isAuthenticated ? (
                  <HoverButton
                    className="w-full bg-[#0000FF] hover:bg-[#0000DD]"
                    onClick={() => setLocation("/dashboard")}
                  >
                    Dashboard
                  </HoverButton>
                ) : (
                  <>
                    <Link href="/login">
                      <HoverButton
                        className="w-full bg-black hover:bg-black text-white border border-white/20"
                        style={{ "--circle-start": "#374151", "--circle-end": "#6B7280" } as React.CSSProperties}
                      >
                        Sign In
                      </HoverButton>
                    </Link>
                    <Link href="/signup">
                      <HoverButton className="w-full relative overflow-hidden">
                        Get Started
                      </HoverButton>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )
      }
    </motion.nav >
  );
}

