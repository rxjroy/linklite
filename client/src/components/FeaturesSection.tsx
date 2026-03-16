import { motion } from "framer-motion";
import { Link, BarChart3, Lock, Zap, Share2, QrCode, Clock } from "lucide-react";
import { GradualSpacing } from "@/components/ui/gradual-spacing";

/**
 * FeaturesSection Component
 * 
 * Design Philosophy: Grid-based feature showcase
 * - 6 feature cards with icons
 * - Hover animations with scale and shadow
 * - Indigo-cyan accent colors
 * - Responsive 1-2-3 column layout
 */

import { BentoGrid, type BentoItem } from "@/components/ui/bento-grid";

const features: BentoItem[] = [
  {
    title: "Instant URL Shortening",
    description: "Convert long URLs into short, shareable links in milliseconds",
    icon: <Link className="w-5 h-5 text-[#0000FF]" />,
    status: "Lightning Fast",
    tags: ["Core", "Speed"],
    colSpan: 2,
    hasPersistentHover: true,
  },
  {
    title: "Advanced Analytics",
    description: "Track clicks, devices, browsers, and geographic data in real-time",
    icon: <BarChart3 className="w-5 h-5 text-[#0000FF]" />,
    status: "Live Data",
    tags: ["Metrics", "Insights"],
  },
  {
    title: "Password Protection",
    description: "Add password protection to sensitive links for extra security",
    icon: <Lock className="w-5 h-5 text-[#0000FF]" />,
    tags: ["Security", "Access"],
  },
  {
    title: "QR Code Generation",
    description: "Automatically generate QR codes for every shortened link",
    icon: <QrCode className="w-5 h-5 text-[#0000FF]" />,
    status: "Popular",
    tags: ["Tools", "Offline"],
    colSpan: 2,
  },
  {
    title: "Link Expiry",
    description: "Set expiration dates for temporary links and campaigns",
    icon: <Clock className="w-5 h-5 text-[#0000FF]" />,
    tags: ["Campaigns", "Time-based"],
  },
  {
    title: "Easy Sharing",
    description: "Copy, share, or embed your shortened links anywhere",
    icon: <Share2 className="w-5 h-5 text-[#0000FF]" />,
    tags: ["Social", "Integration"],
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 bg-gradient-to-b from-background via-background to-secondary/30">
      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Powerful Features for
            <div className="mt-2 text-gray-400">
              <GradualSpacing text="Smart Link Management" className="text-gray-400 font-bold m-0 p-0 drop-shadow-none" />
            </div>
          </div>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Everything you need to shorten links, track analytics, and manage your digital presence
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <BentoGrid items={features} />
        </motion.div>
      </div>
    </section>
  );
}
