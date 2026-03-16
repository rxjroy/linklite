"use client";

import { motion } from "framer-motion";

function FloatingPaths({ position }: { position: number }) {
    const paths = Array.from({ length: 12 }, (_, i) => ({ // Reduced from 36
        id: i,
        d: `M-${380 - i * 15 * position} -${189 + i * 18}C-${380 - i * 15 * position
            } -${189 + i * 18} -${312 - i * 15 * position} ${216 - i * 18} ${152 - i * 15 * position
            } ${343 - i * 18}C${616 - i * 15 * position} ${470 - i * 18} ${684 - i * 15 * position
            } ${875 - i * 18} ${684 - i * 15 * position} ${875 - i * 18}`,
        width: 0.8 + i * 0.1,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg
                className="w-full h-full"
                viewBox="0 0 696 316"
                fill="none"
                preserveAspectRatio="xMidYMid slice" // Ensure it covers without distortion
            >
                <title>Background Paths</title>
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke="currentColor"
                        strokeWidth={path.width}
                        strokeOpacity={0.03 + path.id * 0.02}
                        className="text-white"
                        initial={{ pathLength: 0.3, opacity: 0.2 }}
                        animate={{
                            pathLength: 1,
                            opacity: [0.1, 0.3, 0.1],
                            pathOffset: [0, 1],
                        }}
                        transition={{
                            duration: 25 + Math.random() * 15,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

export function BackgroundPaths() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <FloatingPaths position={1} />
            <FloatingPaths position={-1} />
        </div>
    );
}
