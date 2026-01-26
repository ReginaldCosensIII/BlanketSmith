import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAnimation } from "@/contexts/AnimationContext";
import logoHorizontal from "@/assets/logo-horizontal.svg";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Join Beta", href: "/beta-signup" },
  { label: "Feedback", href: "/feedback" },
  { label: "Partner", href: "/partnerships" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const location = useLocation();
  const { setHeaderReady } = useAnimation();

  // Notify context when header animation completes
  useEffect(() => {
    if (logoLoaded) {
      // Small delay to allow fade animation to complete
      const timer = setTimeout(() => {
        setHeaderReady(true);
      }, 400); // Animation duration (0.4s)
      return () => clearTimeout(timer);
    }
  }, [logoLoaded, setHeaderReady]);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
      initial={{ opacity: 0, y: -20 }}
      animate={logoLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={logoHorizontal} 
              alt="BlanketSmith" 
              className="h-[3.85rem] lg:h-[5.5rem] w-auto"
              onLoad={() => setLogoLoaded(true)}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-out ${
                  location.pathname === link.href
                    ? "text-brand-midblue bg-brand-midblue/10 border border-brand-purple/30 shadow-[0_0_15px_rgba(92,174,255,0.3)]"
                    : "text-muted-foreground border border-transparent hover:text-brand-midblue hover:bg-brand-midblue/10 hover:border-brand-purple/30 hover:shadow-[0_0_15px_rgba(92,174,255,0.25)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Button variant="gradient" size="default" asChild>
              <Link to="/beta-signup">Join the Beta</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ease-out ${
                    location.pathname === link.href
                      ? "text-brand-midblue bg-brand-midblue/10 border border-brand-purple/30 shadow-[0_0_15px_rgba(92,174,255,0.3)]"
                      : "text-muted-foreground border border-transparent hover:text-brand-midblue hover:bg-brand-midblue/10 hover:border-brand-purple/30 hover:shadow-[0_0_15px_rgba(92,174,255,0.25)]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 mt-2 border-t border-border">
                <Button variant="gradient" size="lg" className="w-full" asChild>
                  <Link to="/beta-signup" onClick={() => setMobileMenuOpen(false)}>
                    Join the Beta
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </motion.header>
  );
}
