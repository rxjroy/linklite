import { Sidebar } from "@/components/Sidebar";
import { StatsCard } from "@/components/StatsCard";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Globe, MousePointerClick } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import {
  LineChart, Line, BarChart, Bar, PieChart as RechartsPI, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { api } from "@/lib/api";
import type { OverviewStats, LinkAnalytics } from "@shared/types";

const COLORS = ["#0000FF", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function Analytics() {
  const search = useSearch();
  const linkId = new URLSearchParams(search).get("link");

  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [linkAnalytics, setLinkAnalytics] = useState<LinkAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    if (linkId) {
      api.analytics
        .forLink(linkId)
        .then(setLinkAnalytics)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      api.analytics
        .overview()
        .then(setOverview)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [linkId]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Decide what data to show
  const dailyClicks = linkId ? linkAnalytics?.dailyClicks : overview?.dailyClicks;
  const deviceBreakdown = linkAnalytics?.deviceBreakdown ?? [];
  const browserBreakdown = linkAnalytics?.browserBreakdown ?? [];
  const topReferrers = linkAnalytics?.topReferrers ?? [];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-0">
        <div className="container max-w-6xl pt-16 md:pt-8 pb-6 sm:pb-8 px-4 md:px-8">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 text-white">Analytics</h1>
            <p className="text-gray-400">
              {linkId && linkAnalytics
                ? `Insights for /${linkAnalytics.link.slug}`
                : "Overall link performance"}
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex items-center justify-center py-32 text-gray-400">
              Loading analytics…
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8"
              >
                <motion.div variants={itemVariants}>
                  <StatsCard
                    icon={TrendingUp}
                    title="Total Clicks"
                    value={
                      linkId
                        ? (linkAnalytics?.link.totalClicks ?? 0).toLocaleString()
                        : (overview?.totalClicks ?? 0).toLocaleString()
                    }
                    trend={0}
                    color="from-[#0000FF] to-[#0099FF]"
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <StatsCard
                    icon={BarChart3}
                    title="Last 30 Days"
                    value={(overview?.recentClicks ?? 0).toLocaleString()}
                    trend={0}
                    color="from-[#0000FF] to-[#0099FF]"
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <StatsCard
                    icon={Globe}
                    title="Total Links"
                    value={(overview?.totalLinks ?? 0).toString()}
                    trend={0}
                    color="from-[#0000FF] to-[#0099FF]"
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <StatsCard
                    icon={MousePointerClick}
                    title="Avg Daily"
                    value={
                      dailyClicks && dailyClicks.length > 0
                        ? Math.round(
                            dailyClicks.reduce((s, d) => s + d.clicks, 0) / dailyClicks.length
                          ).toLocaleString()
                        : "0"
                    }
                    trend={0}
                    color="from-[#0000FF] to-[#0099FF]"
                  />
                </motion.div>
              </motion.div>

              {/* Click Timeline */}
              {dailyClicks && dailyClicks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="glass-card p-6 mb-6"
                >
                  <h3 className="text-lg font-semibold mb-4 text-white">Click Timeline</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyClicks}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
                      <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="clicks"
                        stroke="#0000FF"
                        strokeWidth={2}
                        dot={{ fill: "#0000FF", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
              )}

              {/* Breakdown Charts (only for per-link analytics) */}
              {linkId && linkAnalytics && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"
                >
                  {/* Device Distribution */}
                  {deviceBreakdown.length > 0 && (
                    <div className="glass-card p-6">
                      <h3 className="text-lg font-semibold mb-4 text-white">Device Distribution</h3>
                      <ResponsiveContainer width="100%" height={260}>
                        <RechartsPI>
                          <Pie
                            data={deviceBreakdown}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={90}
                            dataKey="value"
                          >
                            {deviceBreakdown.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1e293b",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "8px",
                              color: "#fff",
                            }}
                          />
                        </RechartsPI>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Browser Distribution */}
                  {browserBreakdown.length > 0 && (
                    <div className="glass-card p-6">
                      <h3 className="text-lg font-semibold mb-4 text-white">Browser Distribution</h3>
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={browserBreakdown}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
                          <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1e293b",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "8px",
                              color: "#fff",
                            }}
                          />
                          <Bar dataKey="value" fill="#0000FF" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Top Referrers */}
              {topReferrers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="glass-card p-6"
                >
                  <h3 className="text-lg font-semibold mb-4 text-white">Top Referrers</h3>
                  <div className="space-y-3">
                    {topReferrers.map((r, i) => {
                      const max = topReferrers[0].clicks;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-300 truncate">{r.referrer}</p>
                            <div className="mt-1 w-full bg-secondary rounded-full h-1.5">
                              <div
                                className="bg-gradient-to-r from-[#0000FF] to-cyan-500 h-1.5 rounded-full"
                                style={{ width: `${(r.clicks / max) * 100}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-white shrink-0">
                            {r.clicks.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Empty state */}
              {(!dailyClicks || dailyClicks.length === 0) &&
                deviceBreakdown.length === 0 &&
                topReferrers.length === 0 && (
                  <div className="glass-card p-12 text-center">
                    <p className="text-gray-400">No analytics data yet. Share your links to start tracking clicks!</p>
                  </div>
                )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
