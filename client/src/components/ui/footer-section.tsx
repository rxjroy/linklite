'use client';
import React from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'wouter';
import {
    Twitter,
    Github,
    Linkedin,
    Globe,
    Zap,
} from 'lucide-react';

interface FooterLink {
    title: string;
    href: string;
    external?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
}

interface FooterSection {
    label: string;
    links: FooterLink[];
}

const footerLinks: FooterSection[] = [
    {
        label: 'Product',
        links: [
            { title: 'Features', href: '/#features' },
            { title: 'Analytics', href: '/dashboard' },
            { title: 'Dashboard', href: '/dashboard' },
        ],
    },
    {
        label: 'Social',
        links: [
            { title: 'GitHub', href: 'https://github.com/rxjroy', icon: Github, external: true },
        ],
    },
];

export function Footer() {
    return (
        <footer className="relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center rounded-t-3xl border-t border-border/50 bg-[radial-gradient(35%_128px_at_50%_0%,rgba(255,255,255,0.04),transparent)] px-6 py-12 lg:py-16">
            <div className="absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full blur bg-foreground/20" />

            <div className="flex flex-col md:flex-row justify-between items-start w-full gap-12 lg:gap-24">
                <AnimatedContainer className="space-y-4 max-w-sm">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="LinkLite Logo" className="h-[84px] object-contain" />
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        The smart URL shortener with powerful analytics. Create, track, and manage your links in one place.
                    </p>
                    <p className="text-muted-foreground text-xs pt-4">
                        © {new Date().getFullYear()} LinkLite. All rights reserved. Made with ❤️ by <a href="https://github.com/rxjroy">Raj Roy</a>
                    </p>
                </AnimatedContainer>

                <div className="flex gap-16 md:gap-24 lg:gap-32 md:pt-4">
                    {footerLinks.map((section, index) => (
                        <AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
                            <div className="mb-10 md:mb-0">
                                <h3 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">
                                    {section.label}
                                </h3>
                                <ul className="text-muted-foreground space-y-3 text-sm">
                                    {section.links.map((link) => (
                                        <li key={link.title}>
                                            {link.external ? (
                                                <a
                                                    href={link.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:text-foreground inline-flex items-center gap-1.5 transition-all duration-300"
                                                >
                                                    {link.icon && <link.icon className="h-4 w-4" />}
                                                    {link.title}
                                                </a>
                                            ) : (
                                                <Link href={link.href}>
                                                    <a className="hover:text-foreground inline-flex items-center gap-1.5 transition-all duration-300">
                                                        {link.icon && <link.icon className="h-4 w-4" />}
                                                        {link.title}
                                                    </a>
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </AnimatedContainer>
                    ))}
                </div>
            </div>
        </footer>
    );
}

type ViewAnimationProps = {
    delay?: number;
    className?: ComponentProps<typeof motion.div>['className'];
    children: ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
    const shouldReduceMotion = useReducedMotion();

    if (shouldReduceMotion) {
        return <>{children}</>;
    }

    return (
        <motion.div
            initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
            whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.8 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
