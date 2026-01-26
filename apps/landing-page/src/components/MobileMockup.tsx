import mobileScreenshot from "@/assets/mobile-ui-screenshot.png";

export function MobileMockup() {
  return (
    <div 
      className="relative w-full"
      style={{ perspective: "1200px" }}
    >
      <div className="relative w-full">
        {/* Static shadow for depth */}
        <div className="absolute inset-0 -z-10 rounded-[2rem] sm:rounded-[2.5rem] bg-foreground/30 blur-2xl transform translate-y-4 scale-95" />
        
        {/* Ambient glow - brand color accent */}
        <div className="absolute inset-0 -z-20 rounded-[2rem] sm:rounded-[2.5rem] bg-primary/20 blur-3xl transform translate-y-10 scale-125" />
        
        {/* Phone Frame - reduced border radius so corners aren't clipped */}
        <div className="w-full rounded-[1rem] sm:rounded-[1.25rem] overflow-hidden border-[4px] sm:border-[5px] border-foreground/90 bg-foreground/90 relative shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),0_12px_24px_-8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]">
          
          {/* Screen Content - uses a light gray background to match the screenshot's UI */}
          <div className="bg-[#f5f5f5] relative overflow-hidden w-full rounded-[0.5rem] sm:rounded-[0.75rem]">
            {/* Camera notch / Dynamic Island */}
            <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 z-10 w-2.5 sm:w-3 h-2.5 sm:h-3 bg-foreground/80 rounded-full" />
            
            {/* Aspect ratio wrapper - 4:5 for wider proportions */}
            <div className="relative w-full flex flex-col items-center justify-start" style={{ aspectRatio: "4/5" }}>
              
              {/* Screenshot image - full width, natural height, prioritizing header visibility */}
              <img 
                src={mobileScreenshot} 
                alt="BlanketSmith mobile app interface"
                className="w-full h-auto object-contain object-top"
              />
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
