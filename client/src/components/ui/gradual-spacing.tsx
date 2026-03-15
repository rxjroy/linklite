"use client";

import { AnimatePresence, motion, Variants } from "framer-motion";

import { cn } from "@/lib/utils";

interface GradualSpacingProps {
  text: string;
  duration?: number;
  delayMultiple?: number;
  framerProps?: Variants;
  className?: string;
}

function GradualSpacing({
  text,
  duration = 0.5,
  delayMultiple = 0.04,
  framerProps = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },
  className,
}: GradualSpacingProps) {
  return (
    <div className="flex justify-center flex-wrap">
      <AnimatePresence>
        {text.split(" ").map((word, wordI, words) => {
          const previousCharsCount = words
            .slice(0, wordI)
            .reduce((acc, w) => acc + w.length + 1, 0);

          return (
            <div key={wordI} className="flex">
              {word.split("").map((char, charI) => {
                const globalIndex = previousCharsCount + charI;
                return (
                  <motion.h1
                    key={globalIndex}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, margin: "-50px" }}
                    exit="hidden"
                    variants={framerProps}
                    transition={{ duration, delay: globalIndex * delayMultiple }}
                    className={cn("drop-shadow-sm mx-[1px] md:mx-[2px]", className)}
                  >
                    {char}
                  </motion.h1>
                );
              })}
              {wordI < words.length - 1 && (
                <span className={cn("inline-block w-[0.3em]", className)}></span>
              )}
            </div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export { GradualSpacing };
