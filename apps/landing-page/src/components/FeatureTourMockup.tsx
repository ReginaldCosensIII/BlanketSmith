import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroScreenshot from "@/assets/hero-screenshot.png";

export function FeatureTourMockup() {
  const ref = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"]
  });

  // Horizontal rotation animation (rotates in from the side)
  const rotateY = useTransform(scrollYProgress, [0, 1], [-60, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.7, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);
  const x = useTransform(scrollYProgress, [0, 1], [-80, 0]);
  
  // Shadow animation - unified with ToolMockup style (opacity, scale, rotation)
  const shadowOpacity = useTransform(scrollYProgress, [0, 0.6], [0.2, 1]);
  const shadowScale = useTransform(scrollYProgress, [0, 1], [0.88, 0.95]);
  const shadowRotate = useTransform(scrollYProgress, [0, 1], [-2, 0]);

  return (
<div className="mt-8 lg:mt-12 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        {/* 3D Perspective Container */}
        <div 
          ref={ref}
          className="max-w-5xl mx-auto"
          style={{ perspective: "1500px" }}
        >
          <motion.div
            style={{ 
              rotateY, 
              scale,
              opacity,
              x,
              transformStyle: "preserve-3d" 
            }}
          >
            {/* Dynamic Shadow Layer - unified soft blur orb with scale/rotation */}
            <motion.div
              style={{
                opacity: shadowOpacity,
                scale: shadowScale,
                rotateZ: shadowRotate,
              }}
              className="absolute inset-0 -z-10 rounded-xl bg-foreground/70 blur-2xl translate-y-8"
            />
            
            {/* Monitor Frame */}
            <div className="relative">
              {/* Monitor Screen */}
              <div className="rounded-xl overflow-hidden border border-border bg-card relative">
                {/* Browser Top Bar */}
                <div className="bg-secondary/80 border-b border-border px-1.5 py-1 sm:px-3 sm:py-2 md:px-4 md:py-3 flex items-center gap-1 sm:gap-2 md:gap-3">
                  {/* Traffic Lights */}
                  <div className="flex items-center gap-0.5 sm:gap-1.5 md:gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-red-400/80" />
                    <div className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-400/80" />
                    <div className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-green-400/80" />
                  </div>
                  
                  {/* URL Bar */}
                  <div className="flex-1 max-w-md mx-auto">
                    <div className="bg-background/60 rounded px-1.5 py-0.5 sm:px-3 sm:py-1 md:px-4 md:py-1.5 text-[8px] sm:text-xs md:text-sm text-muted-foreground text-center border border-border/50">
                      app.blanketsmith.com
                    </div>
                  </div>
                  
                  {/* Spacer for symmetry */}
                  <div className="w-4 sm:w-10 md:w-14" />
                </div>

                {/* Screenshot with Tour Overlay */}
                <div className="relative bg-background">
                  <img 
                    src={heroScreenshot} 
                    alt="BlanketSmith Pattern Tool Interface - Feature Tour" 
                    className="w-full h-auto block"
                  />
                  
                  {/* Tour Overlay */}
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="text-center p-3 sm:p-6 max-w-[90%] sm:max-w-md">
                      <div className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-2 sm:mb-4 md:mb-6 rounded-full gradient-bg flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 text-primary-foreground ml-0.5" />
                      </div>
                      <h3 className="font-display text-sm sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-1 sm:mb-2 md:mb-3">
                        Interactive Feature Tour
                      </h3>
                      <p className="font-sans text-muted-foreground text-xs sm:text-sm md:text-base mb-2 sm:mb-4 md:mb-6 leading-relaxed">
                        Take a guided walkthrough of BlanketSmith's powerful features and see how easy pattern creation can be.
                      </p>
                      <Button 
                        variant="gradient" 
                        size="sm"
                        className="pointer-events-none sm:h-10 sm:px-5 md:h-12 md:px-8 text-xs sm:text-sm md:text-base"
                        disabled
                      >
                        <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Start Tour
                        <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs opacity-70">(Coming Soon)</span>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Subtle gradient overlay at bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card/50 to-transparent pointer-events-none" />
                </div>
              </div>
              
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
