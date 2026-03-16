import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/ui/hero-section";
import { FeaturesSection } from "@/components/FeaturesSection";
import { motion } from "framer-motion";
import { HoverButton } from "@/components/ui/hover-button";
import { Link } from "wouter";
import { TestimonialsSection } from "@/components/blocks/testimonials-with-marquee";
import { Footer } from "@/components/ui/footer-section";
import { TextRevealByWord } from "@/components/ui/text-reveal";

const testimonials = [
  {
    author: {
      name: "Emma Thompson",
      handle: "@emma_marketing",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
    },
    text: "LinkLite completely changed how we track campaign links. The analytics dashboard is incredibly detailed and easy to use.",
    href: "https://twitter.com/emma_marketing"
  },
  {
    author: {
      name: "David Park",
      handle: "@david_dev",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    text: "The API for generating short links is incredibly fast. We integrated it into our app in less than an hour.",
    href: "https://twitter.com/david_dev"
  },
  {
    author: {
      name: "Sofia Rodriguez",
      handle: "@sofia_social",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
    },
    text: "My bio links look so much cleaner now. Plus, I finally know exactly where my audience is coming from!"
  },
  {
    author: {
      name: "James Wilson",
      handle: "@james_creator",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop&crop=face"
    },
    text: "I've tried a dozen URL shorteners, but LinkLite's custom domains and QR codes make it by far the best tool out there."
  },
  {
    author: {
      name: "Elena Chen",
      handle: "@elena_growth",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face"
    },
    text: "Link protection features give me peace of mind when sharing sensitive documents internally. Highly recommended!"
  }
];

/**
 * Home Landing Page
 * 
 * Design Philosophy: Modern SaaS landing page
 * - Sticky navbar
 * - Hero section with CTA
 * - Features showcase
 * - CTA section
 * - Footer
 */

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Testimonials Section */}
      <TestimonialsSection
        title={<TextRevealByWord text="Trusted by marketers and Developers" />}
        description="Join thousands of users who are already building better campaigns with LinkLite"
        testimonials={testimonials}
      />

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="container max-w-5xl text-center"
        >
          <div className="group relative p-6 sm:p-12 rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 border border-border/50 bg-secondary/20 backdrop-blur-sm shadow-xl">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:4px_4px]" />
            </div>

            <div className="relative z-10">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
                Ready to Shorten Your Links?
              </h2>
              <p className="text-sm sm:text-lg text-gray-400 mb-6 sm:mb-10 max-w-2xl mx-auto">
                Join thousands of users who trust LinkLite for their URL shortening and analytics needs
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <HoverButton className="bg-[#0000FF] text-white hover:bg-[#0000DD] font-semibold px-8 py-4 text-lg">
                    Get Started Free
                  </HoverButton>
                </Link>
                <Link href="/#features">
                  <HoverButton className="bg-transparent border border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg before:hidden shadow-none">
                    Learn More
                  </HoverButton>
                </Link>
              </div>
            </div>

            <div className="absolute inset-0 -z-10 rounded-3xl p-px bg-gradient-to-br from-[#0000FF]/30 via-transparent to-[#0099FF]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
