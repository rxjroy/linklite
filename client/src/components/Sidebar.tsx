import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { LayoutDashboard, BarChart3, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

/**
 * Sidebar Component
 * 
 * Design Philosophy: Minimal dashboard navigation
 * - LinkLite logo at top linking to home
 * - Collapsible on mobile
 * - Active route highlighting with indigo accent
 * - Icons + labels for clarity
 * - Logout button at bottom
 */

export function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-20 left-4 z-40 p-2 hover:bg-secondary rounded-lg smooth-transition"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ duration: 0.3 }}
        className="fixed md:static left-0 top-16 md:top-0 h-[calc(100vh-4rem)] md:h-screen w-64 border-r border-border bg-background flex flex-col z-30"
      >
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center justify-center px-4 py-5 border-b border-border cursor-pointer hover:opacity-80 smooth-transition">
            <img src="/logo.png" alt="LinkLite" className="h-14 object-contain" />
          </div>
        </Link>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      setIsOpen(false);
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-r-lg smooth-transition cursor-pointer relative ${
                    isActive
                      ? "text-indigo-400 font-medium bg-gradient-to-r from-indigo-500/10 to-transparent border-l-4 border-indigo-500"
                      : "text-gray-400 hover:text-white hover:bg-secondary border-l-4 border-transparent"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="border-t border-border p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-gray-400 hover:text-white hover:bg-secondary smooth-transition"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 top-16 bg-black/20 z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

