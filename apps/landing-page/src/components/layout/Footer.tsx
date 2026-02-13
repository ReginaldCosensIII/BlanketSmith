import { Link } from "react-router-dom";
const logoHorizontal = "/branding/logos/bs-logo-horizontal-ink.svg";
const faviconBadge = "/branding/logos/bs-logo-badge.svg";
import { Icon } from "@/components/ui/SharedComponents";

const footerLinks = {
  product: [
    { label: "Join Beta", href: "/beta-signup" },
    { label: "Submit Feedback", href: "/feedback" },
  ],
  company: [
    { label: "Partnerships", href: "/partnerships" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
};

const socialLinks = [
  { icon: 'facebook', href: "https://facebook.com/blanketsmith", label: "Facebook" },
  { icon: 'twitter', href: "https://twitter.com/blanketsmith", label: "Twitter" },
  { icon: 'instagram', href: "https://instagram.com/blanketsmith", label: "Instagram" },
  { icon: 'youtube', href: "https://youtube.com/@blanketsmith", label: "YouTube" },
  { icon: 'tiktok', href: "https://tiktok.com/@blanketsmith", label: "TikTok" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary/30 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block">
              <img
                src={logoHorizontal}
                alt="BlanketSmith"
                className="h-[3.85rem] lg:h-[5.5rem] w-auto mb-4"
              />
            </Link>
            <p className="font-sans text-muted-foreground max-w-md text-sm leading-relaxed">
              A modern tool for modern makers. Transform your ideas into ready-to-use
              blanket patterns instantly. Built for crocheters and knitters who value
              precision and creativity.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-brand-midblue/10 border border-brand-purple/30 flex items-center justify-center text-brand-midblue hover:scale-110 hover:shadow-[0_0_20px_rgba(92,174,255,0.4)] hover:border-brand-midblue/50 transition-all duration-300 ease-out"
                  aria-label={social.label}
                >
                  <Icon name={social.icon} size="md" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Connect</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-sans text-xs text-muted-foreground">
            © {currentYear} BlanketSmith. All rights reserved.
          </p>
          <p className="font-sans text-xs text-muted-foreground flex items-center gap-1">
            Made with <img src={faviconBadge} alt="love" className="h-4 w-4 inline-block" /> and care for the maker community.
          </p>
        </div>
      </div>
    </footer>
  );
}
