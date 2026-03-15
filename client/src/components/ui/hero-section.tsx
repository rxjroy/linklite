import { HoverButton } from "@/components/ui/hover-button";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Sparkles, Link as LinkIcon, BarChart3, Eye, Copy, Trash2, QrCode, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { animate, useInView } from "framer-motion";
import { useRef } from "react";
import { TextRevealCard } from "@/components/ui/text-reveal-card";

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: false, margin: "-50px" });

  useEffect(() => {
    if (inView && ref.current) {
      const controls = animate(0, value, {
        duration: 2,
        ease: "easeOut",
        onUpdate(v) {
          if (ref.current) {
            // Handle decimals for 99.9 vs integers
            if (value % 1 !== 0) {
              ref.current.textContent = v.toFixed(1);
            } else {
              ref.current.textContent = Math.round(v).toString();
            }
          }
        },
      });
      return () => controls.stop();
    } else if (!inView && ref.current) {
      ref.current.textContent = "0"; // Reset when out of view
    }
  }, [inView, value]);

  return <span ref={ref}>0</span>;
}

export function HeroSection() {
  const [url, setUrl] = useState("");
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const handleShortenClick = () => {
    const query = url ? `?url=${encodeURIComponent(url)}` : "";
    if (isAuthenticated) {
      setLocation(`/dashboard${query}`);
    } else {
      setLocation(`/signup${query}`);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundPaths />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full"
      >
        <ContainerScroll
          titleComponent={
            <div className="flex flex-col items-center justify-center w-full mb-8 pt-4 md:pt-10">
              <motion.div variants={itemVariants} className="mb-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-gray-700 bg-gray-900/50 px-4 py-1.5 text-sm font-medium text-gray-400">
                  <Sparkles className="h-4 w-4" />
                  Shorten URLs Instantly
                </span>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="mb-8 text-4xl sm:text-5xl font-bold tracking-tight md:text-7xl text-white flex flex-col items-center w-full max-w-[100vw] overflow-hidden px-2 sm:px-4"
              >
                <span className="text-center w-full block">Shorten Links,</span>
                <div className="w-full max-w-full flex justify-center mt-2 overflow-hidden">
                  <TextRevealCard
                    text="Track Everything"
                    revealText="Analyze Every Click"
                    className="bg-transparent border-none p-0 inline-block w-full max-w-[100vw] sm:max-w-none m-0"
                    textClassName="text-[2.2rem] xs:text-5xl sm:text-5xl md:text-7xl font-bold m-0 p-0 leading-tight whitespace-break-spaces text-center break-words w-full"
                  />
                </div>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="mb-8 max-w-[90vw] md:max-w-2xl text-lg text-foreground/70 mx-auto text-center"
              >
                Create short, shareable links in seconds. Get detailed analytics about every click,
                every visitor, and every interaction. All in one beautiful dashboard.
              </motion.p>

              <motion.div variants={itemVariants} className="flex justify-center w-full max-w-[95vw] sm:max-w-2xl mx-auto px-2 sm:px-0 mt-4 overflow-hidden">
                <div className="flex w-full items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md p-1.5 shadow-[0_0_30px_rgba(79,70,229,0.08)] max-w-full">
                  <input
                    type="url"
                    placeholder="paste long URL..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleShortenClick()}
                    className="flex-1 bg-transparent px-3 sm:px-5 py-2 sm:py-3 text-white placeholder:text-white/40 focus:outline-none text-sm w-full min-w-0"
                  />
                  <HoverButton
                    className="shrink-0 flex items-center justify-center gap-1 sm:gap-2 bg-indigo-600 hover:bg-indigo-700 px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-full whitespace-nowrap min-w-fit"
                    onClick={handleShortenClick}
                  >
                    <span className="hidden sm:inline">Shorten URL</span>
                    <span className="sm:hidden">Shorten</span>
                    <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1" />
                  </HoverButton>
                </div>
              </motion.div>
            </div>
          }
        >
          {/* Dashboard Preview Snippet */}
          <div className="flex flex-col h-full w-full bg-[#0a0a0a]/90 p-4 md:p-6 overflow-hidden select-none">
            {/* Preview Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white">Track Your Links & Get Insights</h3>
                <p className="text-xs text-white/40 mt-0.5">Your real-time analytics dashboard</p>
              </div>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">Live Preview</span>
            </div>

            {/* Stat Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4 min-w-[300px]">
              {[
                { icon: LinkIcon, title: "Total Links", value: "1,248" },
                { icon: BarChart3, title: "Total Clicks", value: "45.2k" },
                { icon: Eye, title: "Last 30 Days", value: "12.8k" },
                { icon: LinkIcon, title: "Avg / Link", value: "36" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-400 p-2 md:p-4 border border-white/10 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/40 cursor-default"
                >
                  <div className="absolute -top-8 -right-8 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="p-1 bg-black/20 rounded-md">
                        <stat.icon className="h-3 w-3 text-white/90" />
                      </div>
                      <p className="text-[10px] md:text-xs font-medium text-white/80">{stat.title}</p>
                    </div>
                    <p className="text-lg md:text-xl font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Fake Links Table */}
            <div className="flex-1 rounded-xl bg-black/40 border border-white/5 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
                <h4 className="text-xs font-bold text-white tracking-wide">Your Links</h4>
                <span className="text-[10px] text-white/30 font-medium">3 of 1,248</span>
              </div>
              <table className="w-full text-xs">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-400 text-[10px] uppercase tracking-wider">Short URL</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-400 text-[10px] uppercase tracking-wider hidden md:table-cell">Original URL</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-400 text-[10px] uppercase tracking-wider">Clicks</th>
                    <th className="px-4 py-2 text-right font-semibold text-gray-400 text-[10px] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { slug: "promo-24", url: "https://mystore.com/spring-sale/2024/landing...", clicks: "2,847" },
                    { slug: "docs-api", url: "https://developers.example.io/v3/reference...", clicks: "1,204" },
                    { slug: "yt-demo", url: "https://youtube.com/watch?v=xK2d8f...", clicks: "956" },
                  ].map((link, i) => (
                    <tr key={i} className="hover:bg-white/[0.03] transition-colors duration-150 cursor-default">
                      <td className="px-4 py-2.5 font-mono text-indigo-400 whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          /{link.slug}
                          <ExternalLink className="h-2.5 w-2.5 opacity-40" />
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-400 truncate max-w-[160px] hidden md:table-cell">{link.url}</td>
                      <td className="px-4 py-2.5 font-semibold text-white">{link.clicks}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-end gap-0.5">
                          {[Copy, QrCode, BarChart3, Trash2].map((Icon, j) => (
                            <span
                              key={j}
                              className={`p-1.5 rounded-md hover:bg-white/10 transition-colors duration-150 cursor-default ${
                                j === 3 ? "text-red-400" : "text-white/40"
                              }`}
                            >
                              <Icon className="h-3 w-3" />
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ContainerScroll>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-64 sm:mt-40 md:mt-64 pb-24 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-foreground/60 relative z-10"
        >
          <motion.div variants={itemVariants} className="text-center">
            <div className="text-4xl font-bold text-white mb-2"><AnimatedNumber value={10} />k+</div>
            <div className="text-base">Links Created</div>
          </motion.div>
          <motion.div variants={itemVariants} className="hidden sm:block h-10 w-px bg-border/50" />
          <motion.div variants={itemVariants} className="text-center">
            <div className="text-4xl font-bold text-white mb-2"><AnimatedNumber value={50} />M+</div>
            <div className="text-base">Total Clicks</div>
          </motion.div>
          <motion.div variants={itemVariants} className="hidden sm:block h-10 w-px bg-border/50" />
          <motion.div variants={itemVariants} className="text-center">
            <div className="text-4xl font-bold text-white mb-2"><AnimatedNumber value={99.9} />%</div>
            <div className="text-base">Uptime</div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
