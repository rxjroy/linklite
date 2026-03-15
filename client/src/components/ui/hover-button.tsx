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
            fadeState: "in" | "out" | null
        }>>([])
        const lastAddedRef = React.useRef(0)

        const createCircle = React.useCallback((x: number, y: number) => {
            const buttonWidth = buttonRef.current?.offsetWidth || 0
            const xPos = x / buttonWidth
            // Updated to match LinkLite's Indigo-to-Cyan theme
            const color = `linear-gradient(to right, var(--circle-start) ${xPos * 100}%, var(--circle-end) ${xPos * 100
                }%)`

            setCircles((prev) => [
                ...prev,
                { id: Date.now(), x, y, color, fadeState: null },
            ])
        }, [])

        const handlePointerMove = React.useCallback(
            (event: React.PointerEvent<HTMLButtonElement>) => {
                if (!isListening) return

                const currentTime = Date.now()
                if (currentTime - lastAddedRef.current > 100) {
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

        React.useEffect(() => {
            circles.forEach((circle) => {
                if (!circle.fadeState) {
                    setTimeout(() => {
                        setCircles((prev) =>
                            prev.map((c) =>
                                c.id === circle.id ? { ...c, fadeState: "in" } : c
                            )
                        )
                    }, 0)

                    setTimeout(() => {
                        setCircles((prev) =>
                            prev.map((c) =>
                                c.id === circle.id ? { ...c, fadeState: "out" } : c
                            )
                        )
                    }, 1000)

                    setTimeout(() => {
                        setCircles((prev) => prev.filter((c) => c.id !== circle.id))
                    }, 2200)
                }
            })
        }, [circles])

        return (
            <button
                ref={buttonRef}
                className={cn(
                    "relative isolate px-8 py-3 rounded-full",
                    "text-white font-medium text-base leading-6",
                    "bg-indigo-600 hover:bg-indigo-700",
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
                    "--circle-start": "#4F46E5", // Indigo-600 (default)
                    "--circle-end": "#06B6D4",   // Cyan-500 (default)
                    ...style,
                } as React.CSSProperties}
            >
                {circles.map(({ id, x, y, color, fadeState }) => (
                    <div
                        key={id}
                        className={cn(
                            "absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full",
                            "blur-md pointer-events-none z-[-1] transition-opacity duration-300",
                            fadeState === "in" && "opacity-100",
                            fadeState === "out" && "opacity-0 duration-[1.2s]",
                            !fadeState && "opacity-0"
                        )}
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
