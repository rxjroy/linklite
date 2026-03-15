"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "framer-motion";

export interface BentoItem {
    title: string;
    description: string;
    icon: React.ReactNode;
    status?: string;
    tags?: string[];
    meta?: string;
    cta?: string;
    colSpan?: number;
    hasPersistentHover?: boolean;
}

interface BentoGridProps {
    items: BentoItem[];
}

function BentoGrid({ items }: BentoGridProps) {
    return (
        <div className="flex flex-col md:grid md:grid-cols-3 gap-6 md:gap-4 p-4 max-w-7xl mx-auto">
            {items.map((item, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ 
                        duration: 0.5, 
                        delay: index * 0.1, 
                        type: "spring",
                        stiffness: 100 
                    }}
                    className={cn(
                        "group relative p-6 rounded-2xl overflow-hidden transition-all duration-300",
                        "border border-border/50 bg-secondary/20 backdrop-blur-sm",
                        "hover:shadow-[0_2px_12px_rgba(255,255,255,0.03)]",
                        "hover:-translate-y-1 will-change-transform",
                        item.colSpan === 2 ? "md:col-span-2" : "col-span-1",
                        item.colSpan === 3 ? "md:col-span-3" : "",
                        {
                            "shadow-[0_2px_12px_rgba(255,255,255,0.03)] -translate-y-1 bg-secondary/40":
                                item.hasPersistentHover,
                        }
                    )}
                >
                    <div
                        className={`absolute inset-0 ${item.hasPersistentHover
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100"
                            } transition-opacity duration-300`}
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:4px_4px]" />
                    </div>

                    <div className="relative flex flex-col h-full space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:bg-gradient-to-br from-blue-600/20 to-blue-400/20 transition-all duration-300">
                                {item.icon}
                            </div>
                            {item.status && (
                                <span
                                    className={cn(
                                        "text-xs font-medium px-2.5 py-1 rounded-lg backdrop-blur-sm",
                                        "bg-white/5 text-gray-300 border border-white/5",
                                        "transition-colors duration-300 group-hover:bg-white/10"
                                    )}
                                >
                                    {item.status}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2 flex-grow">
                            <h3 className="font-semibold text-white tracking-tight text-lg">
                                {item.title}
                                {item.meta && (
                                    <span className="ml-2 text-xs text-indigo-400 font-normal border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                                        {item.meta}
                                    </span>
                                )}
                            </h3>
                            <p className="text-sm text-gray-400 leading-relaxed font-[425]">
                                {item.description}
                            </p>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <div className="flex flex-wrap gap-2 items-center text-xs text-gray-400">
                                {item.tags?.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 backdrop-blur-sm transition-all duration-200 hover:bg-white/10"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                            <span className="text-xs font-medium text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ml-4">
                                {item.cta || "Explore →"}
                            </span>
                        </div>
                    </div>

                    <div
                        className={`absolute inset-0 -z-10 rounded-2xl p-px bg-gradient-to-br from-blue-600/20 via-transparent to-blue-400/20 ${item.hasPersistentHover
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100"
                            } transition-opacity duration-500`}
                    />
                </motion.div>
            ))}
        </div>
    );
}

export { BentoGrid };
