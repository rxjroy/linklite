"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    // Offset to trigger earlier
    offset: ["start start", "end end"]
  });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.8, 1] : [0.95, 1]; // Start slightly smaller for depth
  };

  // Card transforms
  const rotate = useTransform(scrollYProgress, [0, 1], [40, 0]); // Doubled rotation for 3D realism
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -120]); // Push slightly higher up

  // Header transforms (Ferris wheel effect) - Exaggerated for a more defined wheel animation
  const headerTranslateY = useTransform(scrollYProgress, [0, 1], [0, -350]); // Pushes higher up
  const headerTranslateZ = useTransform(scrollYProgress, [0, 1], [0, -400]); // Deeper into the background
  const headerRotateX = useTransform(scrollYProgress, [0, 1], [0, -85]); // Almost a full 90-degree tilt backwards
  const headerOpacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 0.2, 0]); // Fades slightly slower so you can see it tilt more

  return (
    <div
      className="h-[45rem] sm:h-[40rem] md:h-[50rem] min-h-[55rem] sm:min-h-0 flex items-start justify-center relative p-2 md:p-4"
      ref={containerRef}
    >
      <div
        className="w-full relative"
        style={{
          perspective: "1000px",
        }}
      >
        <Header 
          translateY={headerTranslateY} 
          translateZ={headerTranslateZ} 
          rotateX={headerRotateX} 
          opacity={headerOpacity} 
          titleComponent={titleComponent} 
        />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({ 
  translateY, 
  translateZ,
  rotateX,
  opacity,
  titleComponent 
}: { 
  translateY: MotionValue<number>;
  translateZ: MotionValue<number>;
  rotateX: MotionValue<number>;
  opacity: MotionValue<number>;
  titleComponent: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        y: translateY,
        z: translateZ,
        rotateX,
        opacity,
        transformOrigin: "bottom center", // Anchor the rotation at the bottom so it tips back
      }}
      className="max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  translate,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        y: translate,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="max-w-5xl -mt-12 mx-auto w-full border border-white/10 p-1.5 sm:p-2 md:p-6 bg-secondary/10 backdrop-blur-sm rounded-2xl sm:rounded-[30px] shadow-2xl relative z-20"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-black/40 backdrop-blur-xl md:rounded-2xl md:p-4">
        {children}
      </div>
    </motion.div>
  );
};
