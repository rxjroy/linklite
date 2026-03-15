import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

/**
 * StatsCard Component
 * 
 * Design Philosophy: Minimal stat display
 * - Icon with gradient background
 * - Title and value
 * - Trend indicator (up/down)
 * - Hover animation
 */

interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  trend?: number;
  color: string;
}

export function StatsCard({ icon: Icon, title, value, trend, color }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br ${color} p-4 sm:p-6 shadow-lg shadow-black/20 smooth-transition hover:shadow-xl hover:shadow-black/40 border border-white/10`}
    >
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3 sm:mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-black/20 rounded-lg backdrop-blur-sm">
              <Icon className="h-5 w-5 text-white/90" />
            </div>
            <p className="text-sm font-medium text-white/90">{title}</p>
          </div>
        </div>
        
        <div className="flex items-end justify-between">
          <p className="text-xl sm:text-3xl font-bold text-white tracking-tight">{value}</p>
          
          {trend !== undefined && (
            <div className="flex flex-col items-end">
              <div
                className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md backdrop-blur-sm ${
                  trend > 0 ? "bg-emerald-500/20 text-emerald-100" : "bg-red-500/20 text-red-100"
                }`}
              >
                {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(trend)}%
              </div>
              <span className="text-[10px] text-white/60 mt-1 uppercase tracking-wider">
                Last month
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
