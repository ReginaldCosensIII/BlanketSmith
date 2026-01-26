import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import betaUIScreenshot from "@/assets/beta-ui-screenshot.png";
import { MobileMockup } from "./MobileMockup";

export function ToolMockup() {
  const containerRef = useRef(null);
  
  // Scroll-lock style animation using extended scroll range
  // The parent section provides scroll estate, this sticky container animates within it
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Spring config for smooth, polished motion
  const springConfig = { stiffness: 100, damping: 20, mass: 0.5 };

  // === PHASE 1: Browser Entrance (0% - 35% scroll) ===
  // Browser rotates in from a tilted perspective and settles completely before mobile begins
  const browserRotateX = useTransform(scrollYProgress, [0, 0.35], [30, 0]);
  const browserRotateY = useTransform(scrollYProgress, [0, 0.35], [-15, 0]);
  const browserScale = useTransform(scrollYProgress, [0, 0.35], [0.85, 1]);
  const browserOpacity = useTransform(scrollYProgress, [0, 0.15], [0, 1]);
  const browserY = useTransform(scrollYProgress, [0, 0.35], [60, 0]);
  
  // Browser shadow - intensifies, scales, and rotates as it settles (matching mobile behavior)
  const browserShadowOpacity = useTransform(scrollYProgress, [0.15, 0.35], [0.2, 1]);
  const browserShadowScale = useTransform(scrollYProgress, [0, 0.35], [0.88, 0.95]);
  const browserShadowRotate = useTransform(scrollYProgress, [0, 0.35], [-2, 0]);
  
  // === PHASE 2: Mobile Entrance (40% - 70% scroll) ===
  // Mobile starts after browser is fully settled, rises up dramatically to overlap
  const mobileOpacity = useTransform(scrollYProgress, [0.4, 0.5], [0, 1]);
  const mobileYRaw = useTransform(scrollYProgress, [0.4, 0.7], [100, 0]);
  const mobileScaleRaw = useTransform(scrollYProgress, [0.4, 0.7], [0.85, 1]);
  const mobileRotateXRaw = useTransform(scrollYProgress, [0.4, 0.7], [12, 0]);
  
  // Apply spring physics to mobile entrance for bouncy, polished feel
  const mobileY = useSpring(mobileYRaw, springConfig);
  const mobileScale = useSpring(mobileScaleRaw, springConfig);
  const mobileRotateX = useSpring(mobileRotateXRaw, springConfig);
  
  // === PHASE 3: Convergence & Depth (55% - 80% scroll) ===
  // Mobile comes forward in Z-space, shadow deepens and rotates for layered 3D effect
  const mobileZRaw = useTransform(scrollYProgress, [0.55, 0.75], [0, 50]);
  const mobileZ = useSpring(mobileZRaw, springConfig);
  const mobileShadowIntensity = useTransform(scrollYProgress, [0.5, 0.8], [0.2, 1]);
  const mobileShadowScale = useTransform(scrollYProgress, [0.4, 0.8], [0.85, 0.92]);
  const mobileShadowRotate = useTransform(scrollYProgress, [0.4, 0.8], [3, 0]);

  return (
    <div 
      ref={containerRef}
      className="relative min-h-[120vh] md:min-h-[140vh]"
    >
      {/* Sticky container - pins mockups during scroll animation */}
      <div className="sticky top-[10vh] md:top-[15vh] flex flex-col items-center">
        {/* Browser Mockup Container */}
        <div className="max-w-5xl mx-auto w-full px-4 relative z-0">
          <div 
            className="w-full mx-auto"
            style={{ perspective: "1500px" }}
          >
            <motion.div
              style={{ 
                rotateX: browserRotateX, 
                rotateY: browserRotateY, 
                scale: browserScale,
                opacity: browserOpacity,
                y: browserY,
                transformStyle: "preserve-3d" 
              }}
            >
              {/* Dynamic Shadow Layer - unified soft blur orb with scale/rotation */}
              <motion.div
                style={{ 
                  opacity: browserShadowOpacity,
                  scale: browserShadowScale,
                  rotateZ: browserShadowRotate,
                }}
                className="absolute inset-0 -z-10 rounded-xl bg-foreground/70 blur-2xl translate-y-8"
              />
              
              {/* Browser Frame */}
              <div className="rounded-xl overflow-hidden border border-border bg-card relative">
                {/* Browser Top Bar */}
                <div className="bg-secondary/80 border-b border-border px-1 py-0.5 sm:px-3 sm:py-2 md:px-4 md:py-3 flex items-center gap-0.5 sm:gap-2 md:gap-3 relative z-10">
                  {/* Traffic Lights */}
                  <div className="flex items-center gap-[2px] sm:gap-1.5 md:gap-2">
                    <div className="w-1 h-1 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-red-400/80" />
                    <div className="w-1 h-1 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-400/80" />
                    <div className="w-1 h-1 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-green-400/80" />
                  </div>
                  
                  {/* URL Bar */}
                  <div className="flex-1 max-w-md mx-auto">
                    <div className="bg-background/60 rounded px-1 py-[2px] sm:px-3 sm:py-1 md:px-4 md:py-1.5 text-[6px] sm:text-xs md:text-sm text-muted-foreground text-center border border-border/50">
                      app.blanketsmith.com
                    </div>
                  </div>
                  
                  {/* Spacer for symmetry */}
                  <div className="w-3 sm:w-10 md:w-14" />
                </div>

                {/* Screenshot */}
                <div className="relative bg-background">
                  <img 
                    src={betaUIScreenshot} 
                    alt="BlanketSmith Pattern Tool Interface" 
                    className="w-full h-auto block"
                  />
                  
                  {/* Subtle gradient overlay at bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card/50 to-transparent pointer-events-none" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Mobile Mockup - rises from below and overlaps browser */}
        <motion.div 
          className="w-[100px] sm:w-[140px] md:w-[160px] lg:w-[200px] mx-auto relative z-20 -mt-12 sm:-mt-16 md:-mt-20 lg:-mt-24"
          style={{
            opacity: mobileOpacity,
            y: mobileY,
            scale: mobileScale,
            rotateX: mobileRotateX,
            z: mobileZ,
            transformStyle: "preserve-3d",
            perspective: "1200px",
          }}
        >
          {/* Dynamic depth shadow - unified soft blur orb matching browser style */}
          <motion.div 
            className="absolute inset-0 -z-10 rounded-[2rem] bg-foreground/50 blur-2xl"
            style={{
              opacity: mobileShadowIntensity,
              scale: mobileShadowScale,
              rotateZ: mobileShadowRotate,
              y: 20,
            }}
          />
          <MobileMockup />
        </motion.div>
      </div>
    </div>
  );
}
