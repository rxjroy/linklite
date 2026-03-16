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
      className={`relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br ${color} p-3 sm:p-6 shadow-lg shadow-black/20 transition-all duration-300 ease-out hover:shadow-xl hover:shadow-black/40 border border-white/10 will-change-transform`}
    >
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2 sm:mb-4">
          <div className="p-1.5 sm:p-2 bg-black/20 rounded-lg shrink-0">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white/90" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-white/90 leading-tight">{title}</p>
        </div>
        
        <div className="flex items-end justify-between gap-1">
          <p className="text-lg sm:text-3xl font-bold text-white tracking-tight">{value}</p>
          
          {trend !== undefined && (
            <div className="flex flex-col items-end shrink-0">
              <div
                className={`flex items-center gap-0.5 text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md ${
                  trend > 0 ? "bg-emerald-500/20 text-emerald-100" : "bg-red-500/20 text-red-100"
                }`}
              >
                {trend > 0 ? <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> : <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                {Math.abs(trend)}%
              </div>
              <span className="text-[8px] sm:text-[10px] text-white/60 mt-0.5 uppercase tracking-wider">
                Last month
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
