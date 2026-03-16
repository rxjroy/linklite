"use client";
import React, { useEffect, useRef, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { cn } from "@/lib/utils";

export const TextRevealCard = ({
  text,
  revealText,
  children,
  className,
  textClassName,
}: {
  text: string;
  revealText: string;
  children?: React.ReactNode;
  className?: string;
  textClassName?: string;
}) => {
  const [widthPercentage, setWidthPercentage] = useState(0);
  const cardRef = useRef<HTMLDivElement | any>(null);
  const [left, setLeft] = useState(0);
  const [localWidth, setLocalWidth] = useState(0);
  const [isMouseOver, setIsMouseOver] = useState(false);

  useEffect(() => {
    if (cardRef.current) {
      const { left, width: localWidth } =
        cardRef.current.getBoundingClientRect();
      setLeft(left);
      setLocalWidth(localWidth);
    }
  }, []);

  function mouseMoveHandler(event: any) {
    event.preventDefault();

    const { clientX } = event;
    if (cardRef.current) {
      const relativeX = clientX - left;
      const newPercentage = (relativeX / localWidth) * 100;
      // Small optimization: only update if change is significant
      if (Math.abs(newPercentage - widthPercentage) > 0.1) {
        setWidthPercentage(newPercentage);
      }
    }
  }

  function mouseLeaveHandler() {
    setIsMouseOver(false);
    setWidthPercentage(0);
  }
  function mouseEnterHandler() {
    setIsMouseOver(true);
  }
  function touchMoveHandler(event: React.TouchEvent<HTMLDivElement>) {
    const clientX = event.touches[0]!.clientX;
    if (cardRef.current) {
      const relativeX = clientX - left;
      setWidthPercentage((relativeX / localWidth) * 100);
    }
  }

  const rotateDeg = (widthPercentage - 50) * 0.1;
  return (
    <div
      onMouseEnter={mouseEnterHandler}
      onMouseLeave={mouseLeaveHandler}
      onMouseMove={mouseMoveHandler}
      onTouchStart={mouseEnterHandler}
      onTouchEnd={mouseLeaveHandler}
      onTouchMove={touchMoveHandler}
      ref={cardRef}
      className={cn(
        "relative overflow-hidden w-full inline-block cursor-crosshair",
        className
      )}
    >
      {children}

      <div className="relative flex items-center justify-center overflow-hidden">
        <div style={{ display: "grid" }} className="w-full">
          {/* Base Text */}
          <div style={{ gridArea: "1/1" }} className="overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,white,transparent)]">
            <p className={cn("bg-clip-text text-transparent bg-[#323238]", textClassName)}>
              {text}
            </p>
            <MemoizedStars active={isMouseOver} />
          </div>

          {/* Reveal Text */}
          <motion.div
            style={{ gridArea: "1/1", width: "100%" }}
            animate={
              isMouseOver
                ? {
                    opacity: widthPercentage > 0 ? 1 : 0,
                    clipPath: `inset(0 ${100 - widthPercentage}% 0 0)`,
                  }
                : {
                    clipPath: `inset(0 ${100 - widthPercentage}% 0 0)`,
                  }
            }
            transition={isMouseOver ? { duration: 0 } : { duration: 0.4 }}
            className="z-20 will-change-[clip-path,opacity]"
          >
            <p
              style={{ textShadow: "4px 4px 15px rgba(0,0,0,0.5)" }}
              className={cn("bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-300", textClassName)}
            >
              {revealText}
            </p>
          </motion.div>
          
          {/* Slider line */}
          <motion.div
            animate={{
              left: `${widthPercentage}%`,
              rotate: `${rotateDeg}deg`,
              opacity: widthPercentage > 0 ? 1 : 0,
            }}
            transition={isMouseOver ? { duration: 0 } : { duration: 0.4 }}
            className="h-full w-[8px] bg-gradient-to-b from-transparent via-neutral-200 to-transparent absolute z-50 will-change-[left,rotate,opacity]"
          ></motion.div>
        </div>
      </div>
    </div>
  );
};

export const TextRevealCardTitle = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <h2 className={twMerge("text-white text-lg mb-2", className)}>
      {children}
    </h2>
  );
};

export const TextRevealCardDescription = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <p className={twMerge("text-[#a9a9a9] text-sm", className)}>{children}</p>
  );
};

const Stars = ({ active }: { active: boolean }) => {
  const random = () => Math.random();
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <AnimatePresence>
        {active && [...Array(12)].map((_, i) => ( // Reduced from 30 to 12
          <motion.span
            key={`star-${i}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.2, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: random() * 2 + 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              top: `${random() * 100}%`,
              left: `${random() * 100}%`,
              width: `2px`,
              height: `2px`,
              backgroundColor: "white",
              borderRadius: "50%",
            }}
            className="inline-block"
          ></motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
};

export const MemoizedStars = memo(Stars);
