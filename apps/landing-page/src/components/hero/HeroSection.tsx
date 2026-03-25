import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, Variants, Easing } from "framer-motion";
import { Icon } from "@/components/ui/SharedComponents";
import { Button } from "@/components/ui/button";
import { useAnimation } from "@/contexts/AnimationContext";
const logoBadge = "/branding/logos/bs-badge-master.svg";
// import heroScreenshot from "@/assets/hero-screenshot.png";
// import mobileScreenshot from "@/assets/mobile-ui-screenshot.png";
const heroScreenshot = "/branding/images/ui-mockup-landing-hero.png";
const mobileScreenshot = "/branding/images/ui-mockup-landing-mobile.png";

export function HeroSection() {
  const [badgeLoaded, setBadgeLoaded] = useState(false);
  const { headerReady } = useAnimation();

  // Both conditions must be true to start hero animations
  const canAnimate = headerReady && badgeLoaded;

  // Stagger configuration: 150ms gaps
  const staggerDelay = 0.15;

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  const easeOut: Easing = [0.16, 1, 0.3, 1];

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: easeOut,
      },
    },
  };

  return (
    <section className="relative overflow-hidden w-full min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] flex flex-col justify-center py-6 md:py-8 lg:py-10">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        {/* Decorative blur orbs - symmetrical gradient orbs */}
        <div className="absolute top-0 right-0 w-[280px] h-[280px] md:w-[400px] md:h-[400px] lg:w-[480px] lg:h-[480px] 3xl:w-[600px] 3xl:h-[600px] opacity-20 lg:opacity-25 blur-3xl rounded-full gradient-bg transform translate-x-[22%] -translate-y-[28%] 3xl:translate-x-[15%] 3xl:-translate-y-[20%]" />
        <div className="absolute bottom-0 left-0 w-[260px] h-[260px] md:w-[380px] md:h-[380px] lg:w-[450px] lg:h-[450px] 3xl:w-[580px] 3xl:h-[580px] opacity-20 lg:opacity-25 blur-3xl rounded-full gradient-bg transform -translate-x-[30%] translate-y-[32%] 3xl:-translate-x-[20%] 3xl:translate-y-[22%]" />
        {/* Cyan accent orbs in opposite corners */}
        <div className="hidden md:block absolute top-0 left-0 w-[450px] h-[450px] lg:w-[550px] lg:h-[550px] 3xl:w-[700px] 3xl:h-[700px] blur-3xl rounded-full accent-orb transform -translate-x-[24%] -translate-y-[26%] 3xl:-translate-x-[18%] 3xl:-translate-y-[18%]" />
        <div className="hidden md:block absolute bottom-0 right-0 w-[380px] h-[380px] lg:w-[450px] lg:h-[450px] 3xl:w-[580px] 3xl:h-[580px] blur-3xl rounded-full accent-orb transform translate-x-[32%] translate-y-[30%] 3xl:translate-x-[22%] 3xl:translate-y-[20%]" />

        {/* Graph paper texture with grid */}
        <div
          className="absolute inset-0 opacity-[0.025] md:opacity-[0.03] lg:opacity-[0.05] mix-blend-multiply"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--muted-foreground)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--muted-foreground)) 1px, transparent 1px)
            `,
            backgroundSize: "30px 30px",
          }}
        />

        {/* Red crosshair guidelines pointing to content - desktop only */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none">
          {/* Vertical dashed line */}
          <div
            className="absolute left-1/2 top-0 bottom-0 w-0 -translate-x-1/2 border-l-2 border-dashed opacity-[0.08]"
            style={{ borderColor: "hsl(340, 82%, 52%)" }}
          />
          {/* Horizontal dashed line - positioned at content center */}
          <div
            className="absolute top-1/2 left-0 right-0 h-0 -translate-y-1/2 border-t-2 border-dashed opacity-[0.08]"
            style={{ borderColor: "hsl(340, 82%, 52%)" }}
          />
        </div>

        {/* Tablet crosshair - more subtle */}
        <div className="hidden md:block lg:hidden absolute inset-0 pointer-events-none">
          <div
            className="absolute left-1/2 top-0 bottom-0 w-0 -translate-x-1/2 border-l border-dashed opacity-[0.05]"
            style={{ borderColor: "hsl(340, 82%, 52%)" }}
          />
          <div
            className="absolute top-1/2 left-0 right-0 h-0 -translate-y-1/2 border-t border-dashed opacity-[0.05]"
            style={{ borderColor: "hsl(340, 82%, 52%)" }}
          />
        </div>

        {/* White radial gradient behind content for readability */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,hsl(var(--background)/0.9),transparent_60%)] md:bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,hsl(var(--background)/0.85),transparent_55%)] 3xl:bg-[radial-gradient(ellipse_35%_45%_at_50%_50%,hsl(var(--background)/0.9),transparent_50%)]" />
      </div>

      {/* Preload the badge image (hidden) to track loading */}
      <img
        src={logoBadge}
        alt=""
        className="sr-only"
        onLoad={() => setBadgeLoaded(true)}
      />

      {/* Central Content Wrapper - ensures cohesive vertical stacking within flex parent */}
      <div className="relative z-10 flex flex-col w-full">
        {/* Beta Badge - positioned closer to header to avoid collision with floating logo */}
        <motion.div
          className="text-center -mt-2 md:-mt-4"
          initial={{ opacity: 0, y: 30 }}
          animate={canAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-midblue/10 border border-brand-purple/30 cursor-pointer transition-all duration-300 ease-out hover:scale-110 hover:shadow-[0_0_20px_rgba(92,174,255,0.4)] hover:border-brand-midblue/50">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-midblue opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-midblue"></span>
          </span>
          <span className="text-sm font-medium text-brand-midblue">Beta Release Coming Soon!</span>
        </div>
      </motion.div>

      {/* Main Hero Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-6 md:mt-[3vh] lg:mt-[5vh] relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate={canAnimate ? "visible" : "hidden"}
        >
          {/* Badge Logo */}
          <motion.div className="mb-6 md:mb-[3vh] lg:mb-[4vh]" variants={itemVariants}>
            <img
              src={logoBadge}
              alt="BlanketSmith"
              className="h-28 sm:h-32 md:h-36 lg:h-[18vh] min-h-[110px] max-h-[160px] w-auto mx-auto animate-float"
            />
          </motion.div>

          {/* Brand Name */}
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground mb-4 md:mb-[2vh] lg:mb-[3vh]"
            style={{ fontFamily: "'Poppins', sans-serif" }}
            variants={itemVariants}
          >
            BlanketSmith
          </motion.h1>

          {/* Tagline */}
          <motion.h2
            className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight mb-5 md:mb-[3vh] lg:mb-[4vh]"
            variants={itemVariants}
          >
            A Modern Tool for{" "}
            <span className="gradient-text">Modern Makers</span>
          </motion.h2>

          {/* Subheadline - Widened and scaled for Tablet Readability */}
          <motion.p
            className="font-sans text-base sm:text-lg md:text-xl md:leading-relaxed text-muted-foreground max-w-2xl md:max-w-3xl mx-auto mb-6 md:mb-[5vh] lg:mb-[7vh]"
            variants={itemVariants}
          >
            BlanketSmith transforms your ideas into ready-to-use blanket patterns instantly.
            Designed for crocheters and knitters who value precision, creativity, and a
            streamlined workflow.
          </motion.p>

          {/* CTA */}
          <motion.div className="mt-2 md:mt-[4vh] lg:mt-[6vh]" variants={itemVariants}>
            <Button variant="gradient" size="xl" asChild>
              <Link to="/beta-signup">
                Sign Up for the Beta
                <Icon name="arrow-right" size="sm" className="ml-1" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
      </div>
    </section>
  );
}
