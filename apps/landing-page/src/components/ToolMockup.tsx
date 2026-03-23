import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { MobileMockup } from "./MobileMockup";
import { Icon } from "@/components/ui/SharedComponents";

const betaUIScreenshot = "/branding/images/ui-mockup-landing-beta.png";

const LEFT_FEATURES = [
  {
    icon: "feature-precision",
    title: "Precision Grids",
    desc: "Pixel-perfect stitch grids that match your gauge exactly.",
  },
  {
    icon: "feature-color",
    title: "Color Palettes",
    desc: "Build palettes from yarn brands or custom hex colors.",
  },
  {
    icon: "feature-layers",
    title: "Multi-Layer Patterns",
    desc: "Stack elements for complex colorwork designs.",
  },
];

const RIGHT_FEATURES = [
  {
    icon: "feature-preview",
    title: "Live Preview",
    desc: "See your blanket come to life as you design.",
  },
  {
    icon: "feature-export",
    title: "Export Ready",
    desc: "Download as PDF, PNG, or printable chart formats.",
  },
  {
    icon: "feature-repeat",
    title: "Pattern Repeat",
    desc: "Auto-tile motifs seamlessly across your project.",
  },
];

const ALL_FEATURES = [...LEFT_FEATURES, ...RIGHT_FEATURES];

// Screenshot-matched Hybrid Glass Card
const GLASS_CARD = "group bg-white/20 dark:bg-slate-900/20 backdrop-blur-md border border-white/50 dark:border-slate-700/50 rounded-2xl p-3 md:p-4 flex items-center gap-3 md:gap-4 hover:border-brand-midblue/40 hover:shadow-[0_0_20px_rgba(92,174,255,0.15)] transition-all duration-300 w-[240px] xl:w-[280px] pointer-events-auto shadow-sm";

const ICON_WRAPPER = "w-10 h-10 md:w-12 md:h-12 rounded-[10px] md:rounded-xl bg-gradient-to-br from-brand-midblue/10 to-brand-cyan/10 border border-brand-purple/20 flex justify-center items-center shrink-0 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(92,174,255,0.2)] transition-all duration-300";

export function ToolMockup() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const runwayRef = useRef<HTMLDivElement>(null);

  const springConfig = { stiffness: 100, damping: 20, mass: 0.5 };

  // ── HOOK A: Desktop Entrance Animation ─────────────────────────────────────
  // Tracks exactly the 100vh as the section arrives into the viewport from the bottom
  const { scrollYProgress: entranceProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start start"], 
  });

  const browserRotateX = useTransform(entranceProgress, [0, 0.7], [30, 0]);
  const browserRotateY = useTransform(entranceProgress, [0, 0.7], [-15, 0]);
  const browserScale   = useTransform(entranceProgress, [0, 0.7], [0.85, 1]);
  const browserOpacity = useTransform(entranceProgress, [0, 0.4], [0, 1]);
  const browserY       = useTransform(entranceProgress, [0, 0.7], [60, 0]);

  const browserShadowOpacity = useTransform(entranceProgress, [0.4, 0.7], [0.2, 1]);
  const browserShadowScale   = useTransform(entranceProgress, [0, 0.7], [0.88, 0.95]);
  const browserShadowRotate  = useTransform(entranceProgress, [0, 0.7], [-2, 0]);

  // ── HOOK B: Mobile Sticky Runway (The Cards & Text) ────────────────────────
  // runwayProgress goes 0 -> 1 exactly while the top of the runway is locked at center-screen!
  // It spans 300vh.
  // 0.00 -> 0.15: The Mobile mockups emerges from 0% opacity to 100% while locked in center.
  // 0.15 -> 0.35: Cards fade in!
  // 0.35 -> 0.50: Bottom Text fades in!
  const { scrollYProgress: runwayProgress } = useScroll({
    target: runwayRef,
    offset: ["start center", "end center"],
  });

  // Since runwayProgress = 0 before the lock begins, opacity is guaranteed to be 0
  // while the user is first viewing the Desktop Mockup.
  const mobileOpacity    = useTransform(runwayProgress, [0.0, 0.15], [0, 1]);
  const mobileYRaw       = useTransform(runwayProgress, [0.0, 0.15], [60, 0]);
  const mobileScaleRaw   = useTransform(runwayProgress, [0.0, 0.15], [0.9, 1]);
  const mobileRotateXRaw = useTransform(runwayProgress, [0.0, 0.15], [10, 0]);
  const mobileY          = useSpring(mobileYRaw,       springConfig);
  const mobileScale      = useSpring(mobileScaleRaw,   springConfig);
  const mobileRotateX    = useSpring(mobileRotateXRaw, springConfig);

  const mobileZRaw           = useTransform(runwayProgress, [0.05, 0.15], [0, 50]);
  const mobileZ              = useSpring(mobileZRaw, springConfig);
  const mobileShadowIntensity = useTransform(runwayProgress, [0.05, 0.15], [0.2, 1]);
  const mobileShadowScale     = useTransform(runwayProgress, [0.0, 0.15], [0.85, 0.92]);
  const mobileShadowRotate    = useTransform(runwayProgress, [0.0, 0.15], [3, 0]);

  const cardOpacityRaw = useTransform(runwayProgress, [0.15, 0.35], [0, 1]);
  const cardOpacity    = useSpring(cardOpacityRaw, springConfig);
  
  const leftXRaw = useTransform(runwayProgress, [0.15, 0.35], [-40, 0]);
  const leftX    = useSpring(leftXRaw, springConfig);
  
  const rightXRaw = useTransform(runwayProgress, [0.15, 0.35], [40, 0]);
  const rightX    = useSpring(rightXRaw, springConfig);

  const bottomOpacityRaw = useTransform(runwayProgress, [0.35, 0.50], [0, 1]);
  const bottomOpacity    = useSpring(bottomOpacityRaw, springConfig);
  const bottomYRaw       = useTransform(runwayProgress, [0.35, 0.50], [20, 0]);
  const bottomYText      = useSpring(bottomYRaw, springConfig);

  return (
    <div ref={sectionRef} className="relative w-full pt-16">
      
      {/* ── 1. Desktop Mockup (Natural Flow) ── */}
      {/* This element will organically scroll off the viewport top, completely natively. */}
      <div className="relative w-full max-w-5xl mx-auto px-4 z-10" style={{ perspective: "1500px" }}>
        <motion.div
          style={{
            rotateX: browserRotateX,
            rotateY: browserRotateY,
            scale: browserScale,
            opacity: browserOpacity,
            y: browserY,
            transformStyle: "preserve-3d",
          }}
        >
          <motion.div
            style={{
              opacity: browserShadowOpacity,
              scale: browserShadowScale,
              rotateZ: browserShadowRotate,
            }}
            className="absolute inset-0 -z-10 rounded-xl bg-slate-900/10 dark:bg-black/40 blur-2xl translate-y-8"
          />
          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 relative shadow-2xl">
            <div className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 py-2 md:px-4 md:py-3 flex items-center gap-2 md:gap-3 relative z-10">
              <div className="flex items-center gap-1.5 md:gap-2">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-400/80" />
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-400/80" />
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-400/80" />
              </div>
              <div className="flex-1 max-w-md mx-auto">
                <div className="bg-white/60 dark:bg-black/60 rounded px-3 py-1 md:py-1.5 text-xs md:text-sm text-slate-500 text-center border border-slate-200/50 dark:border-slate-700/50">
                  app.blanketsmith.com
                </div>
              </div>
              <div className="w-10 md:w-14" />
            </div>
            <div className="relative bg-white dark:bg-slate-950">
              <img
                src={betaUIScreenshot}
                alt="BlanketSmith Pattern Tool Interface"
                className="w-full h-auto block"
              />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/80 dark:from-slate-950/80 to-transparent pointer-events-none" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── 2. The Native Mobile Runway ── */}
      {/* Tucked under Desktop to recreate the original overlap. Height creates standard scroll track. */}
      {/* 300vh gives plenty of time for Desktop to retreat before cards fly in. */}
      <div ref={runwayRef} className="relative w-full h-[300vh] -mt-[100px] sm:-mt-[150px] md:-mt-[200px] pointer-events-none">
        
        {/* ── STICKY FOCUS LOCK ── */}
        {/* This perfectly centers the Mobile container. Guaranteed 0% clipping on ANY monitor. */}
        <div className="sticky top-1/2 -translate-y-1/2 w-full z-30 flex flex-col items-center justify-center">

            <div className="relative w-full max-w-[1200px] flex justify-center items-center">
              
              {/* Left Spoke Cards */}
              <motion.div 
                className="hidden lg:flex flex-col gap-6 absolute pr-6 xl:pr-10 z-0 pointer-events-auto"
                style={{ 
                  opacity: cardOpacity, 
                  x: leftX,
                  right: "calc(50% + 110px)" 
                }}
              >
                {LEFT_FEATURES.map((f) => (
                  <div key={f.title} className={GLASS_CARD}>
                    <div className={ICON_WRAPPER}>
                      <Icon name={f.icon} size="sm" className="text-brand-midblue md:w-5 md:h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-display font-bold text-slate-800 dark:text-slate-200 text-[14px] xl:text-[15px] leading-tight m-0">{f.title}</h4>
                      <p className="font-sans text-[12px] xl:text-[13px] text-slate-500 dark:text-slate-400 mt-1 leading-snug m-0">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Mobile Mockup Base */}
              {/* Entrances perfectly delayed manually onto runwayProgress, emerging only after the lock. */}
              <motion.div
                className="w-[120px] sm:w-[150px] md:w-[170px] lg:w-[220px] relative z-30 pointer-events-none"
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
                <motion.div
                  className="absolute inset-0 -z-10 rounded-[2rem] bg-indigo-900/20 dark:bg-black/40 blur-2xl"
                  style={{
                    opacity: mobileShadowIntensity,
                    scale: mobileShadowScale,
                    rotateZ: mobileShadowRotate,
                    y: 20,
                  }}
                />
                <MobileMockup />
              </motion.div>

              {/* Right Spoke Cards */}
              <motion.div 
                className="hidden lg:flex flex-col gap-6 absolute pl-6 xl:pl-10 z-0 pointer-events-auto"
                style={{ 
                  opacity: cardOpacity, 
                  x: rightX,
                  left: "calc(50% + 110px)"
                }}
              >
                {RIGHT_FEATURES.map((f) => (
                  <div key={f.title} className={GLASS_CARD}>
                    <div className={ICON_WRAPPER}>
                      <Icon name={f.icon} size="sm" className="text-brand-midblue md:w-5 md:h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-display font-bold text-slate-800 dark:text-slate-200 text-[14px] xl:text-[15px] leading-tight m-0">{f.title}</h4>
                      <p className="font-sans text-[12px] xl:text-[13px] text-slate-500 dark:text-slate-400 mt-1 leading-snug m-0">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>

            </div>

            {/* ── Mobile Stacked List (< lg) ── */}
            <motion.div 
              className="flex lg:hidden flex-col gap-4 w-full max-w-sm px-4 mt-8 relative z-40 pointer-events-auto"
              style={{ opacity: cardOpacity, y: bottomYText }}
            >
              {ALL_FEATURES.map((f) => (
                <div key={f.title} className={GLASS_CARD + " mx-auto w-full"}>
                  <div className={ICON_WRAPPER}>
                    <Icon name={f.icon} size="sm" className="text-brand-midblue md:w-5 md:h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-display font-bold text-slate-800 dark:text-slate-200 text-[15px] leading-tight m-0">{f.title}</h4>
                    <p className="font-sans text-[13px] text-slate-500 dark:text-slate-400 mt-1 leading-snug m-0">{f.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* ── Clean Bottom Text (Unboxed) ── */}
            <motion.div 
              className="mt-8 md:mt-12 text-center max-w-xl mx-auto px-4 relative z-40 pointer-events-auto h-[100px]"
              style={{ opacity: bottomOpacity, y: bottomYText }}
            >
              <h3 className="font-display text-[26px] md:text-3xl font-bold tracking-tight text-foreground mb-3">
                Design anywhere, on any device.
              </h3>
              <p className="font-sans text-[15px] md:text-lg text-muted-foreground">
                Your patterns stay perfectly in sync—start on desktop, <br className="hidden sm:block" />refine on mobile.
              </p>
            </motion.div>

        </div>
      </div>
    </div>
  );
}
