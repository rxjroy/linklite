"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface HoverButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
}

const HoverButton = React.forwardRef<HTMLButtonElement, HoverButtonProps>(
    ({ className, children, style, ...props }, ref) => {
        const buttonRef = React.useRef<HTMLButtonElement>(null)
        const [isListening, setIsListening] = React.useState(false)
        const [circles, setCircles] = React.useState<Array<{
            id: number
            x: number
            y: number
            color: string
        }>>([])
        const lastAddedRef = React.useRef(0)

        const createCircle = React.useCallback((x: number, y: number) => {
            const buttonWidth = buttonRef.current?.offsetWidth || 0
            const xPos = x / buttonWidth
            const color = `linear-gradient(to right, var(--circle-start) ${xPos * 100}%, var(--circle-end) ${xPos * 100}%)`

            const id = Date.now()
            setCircles((prev) => [...prev, { id, x, y, color }])

            // Clean up circle after animation
            setTimeout(() => {
                setCircles((prev) => prev.filter((c) => c.id !== id))
            }, 2000)
        }, [])

        const handlePointerMove = React.useCallback(
            (event: React.PointerEvent<HTMLButtonElement>) => {
                if (!isListening) return

                const currentTime = Date.now()
                // Throttle circle creation more aggressively
                if (currentTime - lastAddedRef.current > 150) {
                    lastAddedRef.current = currentTime
                    const rect = event.currentTarget.getBoundingClientRect()
                    const x = event.clientX - rect.left
                    const y = event.clientY - rect.top
                    createCircle(x, y)
                }
            },
            [isListening, createCircle]
        )

        const handlePointerEnter = React.useCallback(() => {
            setIsListening(true)
        }, [])

        const handlePointerLeave = React.useCallback(() => {
            setIsListening(false)
        }, [])

        return (
            <button
                ref={buttonRef}
                className={cn(
                    "relative isolate px-8 py-3 rounded-full",
                    "text-white font-medium text-base leading-6",
                    "bg-[#0000FF] hover:bg-[#0000DD]",
                    "cursor-pointer overflow-hidden smooth-transition flex items-center justify-center min-w-max",
                    "before:content-[''] before:absolute before:inset-0",
                    "before:rounded-[inherit] before:pointer-events-none",
                    "before:z-[1]",
                    "before:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2),inset_0_0_16px_0_rgba(255,255,255,0.1),inset_0_-3px_12px_0_rgba(255,255,255,0.15),0_1px_3px_0_rgba(0,0,0,0.50),0_4px_12px_0_rgba(0,0,0,0.45)]",
                    "before:mix-blend-overlay before:transition-transform before:duration-300",
                    "active:before:scale-[0.975]",
                    className
                )}
                onPointerMove={handlePointerMove}
                onPointerEnter={handlePointerEnter}
                onPointerLeave={handlePointerLeave}
                {...props}
                style={{
                    "--circle-start": "#0000FF",
                    "--circle-end": "#0099FF",
                    ...style,
                } as React.CSSProperties}
            >
                <style dangerouslySetInnerHTML={{ __html: `
                    @keyframes circle-fade {
                        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                        20% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
                        100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
                    }
                    .animate-circle {
                        animation: circle-fade 2s ease-out forwards;
                    }
                `}} />
                {circles.map(({ id, x, y, color }) => (
                    <div
                        key={id}
                        className="absolute w-6 h-6 rounded-full blur-md pointer-events-none z-[-1] animate-circle"
                        style={{
                            left: x,
                            top: y,
                            background: color,
                        }}
                    />
                ))}
                {children}
            </button>
        )
    }
)

HoverButton.displayName = "HoverButton"

export { HoverButton }
