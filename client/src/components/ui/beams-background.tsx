"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedGradientBackgroundProps {
    className?: string;
    children?: React.ReactNode;
    intensity?: "subtle" | "medium" | "strong";
}

interface Beam {
    x: number;
    y: number;
    width: number;
    length: number;
    angle: number;
    speed: number;
    opacity: number;
    hue: number;
    pulse: number;
    pulseSpeed: number;
}

function createBeam(width: number, height: number): Beam {
    const angle = -35 + Math.random() * 10;
    return {
        x: Math.random() * width * 1.5 - width * 0.25,
        y: Math.random() * height * 1.5 - height * 0.25,
        width: 30 + Math.random() * 60,
        length: height * 2.5,
        angle: angle,
        speed: 0.6 + Math.random() * 1.2,
        opacity: 0.12 + Math.random() * 0.16,
        hue: 190 + Math.random() * 70,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
    };
}

export function BeamsBackground({
    className,
    intensity = "strong",
    children,
}: AnimatedGradientBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const beamsRef = useRef<Beam[]>([]);
    const animationFrameRef = useRef<number>(0);
    const MINIMUM_BEAMS = 12; // Reduced from 20 for better performance

    const opacityMap = {
        subtle: 0.7,
        medium: 0.85,
        strong: 1,
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { alpha: false }); // Optimization: disable alpha if not needed, but we do need it for the background. Wait, bg is neutral-950.
        if (!ctx) return;

        const updateCanvasSize = () => {
            // Cap dpr and downscale for blurs to drastically improve Chrome performance
            const dpr = Math.min(window.devicePixelRatio || 1, 1.2);
            const downscale = 0.5; // Render at 50% resolution
            canvas.width = window.innerWidth * dpr * downscale;
            canvas.height = window.innerHeight * dpr * downscale;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            ctx.scale(dpr * downscale, dpr * downscale);

            // Fill background initially
            ctx.fillStyle = "#0a0a0a";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const totalBeams = Math.floor(MINIMUM_BEAMS * 1.2);
            beamsRef.current = Array.from({ length: totalBeams }, () =>
                createBeam(window.innerWidth, window.innerHeight) // Use window size for beam calculation
            );
        };

        updateCanvasSize();
        window.addEventListener("resize", updateCanvasSize);

        function resetBeam(beam: Beam, index: number, totalBeams: number) {
            if (!canvas) return beam;
            
            const column = index % 3;
            const spacing = window.innerWidth / 3;

            beam.y = window.innerHeight + 100;
            beam.x =
                column * spacing +
                spacing / 2 +
                (Math.random() - 0.5) * spacing * 0.5;
            beam.width = 100 + Math.random() * 100;
            beam.speed = 0.4 + Math.random() * 0.4; // Slightly slower for smoothness
            beam.hue = 190 + (index * 70) / totalBeams;
            beam.opacity = 0.2 + Math.random() * 0.1;
            return beam;
        }

        function drawBeam(ctx: CanvasRenderingContext2D, beam: Beam) {
            ctx.save();
            ctx.translate(beam.x, beam.y);
            ctx.rotate((beam.angle * Math.PI) / 180);

            const pulsingOpacity =
                beam.opacity *
                (0.8 + Math.sin(beam.pulse) * 0.2) *
                opacityMap[intensity];

            const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);

            // Using fewer color stops for performance
            gradient.addColorStop(0, `hsla(${beam.hue}, 85%, 65%, 0)`);
            gradient.addColorStop(
                0.5,
                `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`
            );
            gradient.addColorStop(1, `hsla(${beam.hue}, 85%, 65%, 0)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
            ctx.restore();
        }

        function animate() {
            if (!canvas || !ctx) return;

            // Use a semi-transparent clear or just fill background to avoid ctx.clearRect being too heavy
            ctx.fillStyle = "#0a0a0a";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Removed ctx.filter blur as it's extremely heavy inside loop

            const totalBeams = beamsRef.current.length;
            beamsRef.current.forEach((beam, index) => {
                beam.y -= beam.speed;
                beam.pulse += beam.pulseSpeed;

                if (beam.y + beam.length < -100) {
                    resetBeam(beam, index, totalBeams);
                }

                drawBeam(ctx, beam);
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        }

        animate();

        return () => {
            window.removeEventListener("resize", updateCanvasSize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [intensity]);

    return (
        <div
            className={cn(
                "relative min-h-screen w-full overflow-hidden bg-neutral-950",
                className
            )}
        >
            <canvas
                ref={canvasRef}
                className="absolute inset-0 will-change-[transform,opacity]"
                style={{ filter: "blur(25px)" }} // Increased blur here to compensate for removed backdrop-filter
            />

            {/* Removed redundant backdrop-filter layer for major performance boost in Chrome */}
            <motion.div
                className="absolute inset-0 bg-neutral-950/20"
                animate={{
                    opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                    duration: 10,
                    ease: "easeInOut",
                    repeat: Number.POSITIVE_INFINITY,
                }}
            />

            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                {children}
            </div>
        </div>
    );
}
