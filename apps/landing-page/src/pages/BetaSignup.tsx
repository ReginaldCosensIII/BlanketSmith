import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import betaCommunityImage from "@/assets/beta-community.jpg";

const betaPerks = [
  "Full access to all beta features",
  "Priority support from the team",
  "Direct influence on the roadmap",
  "Free during the beta period",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }
  },
};

export default function BetaSignup() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast({
      title: "You're on the list!",
      description: "We'll be in touch soon with your beta access details.",
    });
  };

  return (
    <Layout>
      <section className="pt-6 pb-16 lg:pt-8 lg:pb-24 relative">
        <div className="absolute inset-0 radial-gradient-wash pointer-events-none" aria-hidden="true" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-6xl mx-auto"
          >
            {/* Centered Badge */}
            <div className="flex justify-center mb-10">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-brand-midblue/10 border border-brand-purple/30 transition-all duration-300 ease-out hover:scale-110 hover:shadow-[0_0_20px_rgba(92,174,255,0.4)] hover:border-brand-midblue/50">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-midblue opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-midblue"></span>
                </span>
                <span className="text-sm font-medium text-brand-midblue">Limited Beta Spots</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
              {/* Left Column - Info */}
              <div>
                <div className="mb-8 rounded-2xl overflow-hidden border border-border shadow-lg">
                  <img 
                    src={betaCommunityImage} 
                    alt="Crafters collaborating on colorful blanket squares" 
                    className="w-full h-auto object-cover"
                  />
                </div>

                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  Join the BlanketSmith Beta
                </h1>
                
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  Be among the first to experience a new way to create blanket patterns. 
                  Get early access, shape the product, and connect directly with our team.
                </p>

                <ul className="space-y-4 mb-8">
                  {betaPerks.map((perk) => (
                    <li key={perk} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{perk}</span>
                    </li>
                  ))}
                </ul>

                <div className="p-6 rounded-2xl bg-secondary/50 border border-border group transition-all duration-300 ease-out hover:border-brand-purple/50">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-purple via-brand-midblue to-brand-cyan flex items-center justify-center flex-shrink-0 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">What to expect</p>
                      <p className="text-sm text-muted-foreground">
                        After signing up, you'll receive an email with instructions to 
                        access BlanketSmith. We'll also keep you updated on new features 
                        and ask for your feedback along the way.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Form */}
              <div className="lg:sticky lg:top-28">
                {isSubmitted ? (
                  <div className="rounded-2xl glass p-8 lg:p-12 text-center">
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                      className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-brand-purple via-brand-midblue to-brand-cyan flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </motion.div>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                      You're on the list!
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Thanks for joining the BlanketSmith beta. We'll send you access 
                      details and next steps to your email shortly.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      In the meantime, check your inbox for a confirmation email.
                    </p>
                  </div>
                ) : (
                  <motion.form 
                    onSubmit={handleSubmit}
                    className="rounded-2xl glass p-8 lg:p-12"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.h2 variants={itemVariants} className="font-display text-xl font-semibold text-foreground mb-6">
                      Sign up for beta access
                    </motion.h2>

                    <motion.div variants={itemVariants} className="grid sm:grid-cols-2 gap-4 mb-5">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First name</Label>
                        <Input 
                          id="firstName" 
                          placeholder="Jane" 
                          required 
                          maxLength={50}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input 
                          id="lastName" 
                          placeholder="Maker" 
                          required 
                          maxLength={50}
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2 mb-5">
                      <Label htmlFor="email">Email address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="jane@example.com" 
                        required 
                        maxLength={255}
                      />
                      <p className="text-xs text-muted-foreground">
                        We'll send your beta access details here.
                      </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2 mb-5">
                      <Label htmlFor="craft">Primary craft</Label>
                      <select 
                        id="craft"
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        required
                      >
                        <option value="">Select your craft</option>
                        <option value="crochet">Crochet</option>
                        <option value="knitting">Knitting</option>
                        <option value="both">Both crochet and knitting</option>
                        <option value="other">Other fiber arts</option>
                      </select>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2 mb-5">
                      <Label htmlFor="experience">Experience level</Label>
                      <select 
                        id="experience"
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        required
                      >
                        <option value="">Select your level</option>
                        <option value="beginner">Beginner (0-2 years)</option>
                        <option value="intermediate">Intermediate (2-5 years)</option>
                        <option value="advanced">Advanced (5+ years)</option>
                        <option value="professional">Professional / Designer</option>
                      </select>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2 mb-5">
                      <Label htmlFor="interest">What interests you most about BlanketSmith? (optional)</Label>
                      <Textarea 
                        id="interest"
                        placeholder="Tell us what you're hoping to create or any features you're excited about..."
                        className="min-h-[100px] resize-none"
                        maxLength={500}
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <Button 
                        type="submit" 
                        variant="gradient" 
                        size="lg" 
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          "Signing up..."
                        ) : (
                          <>
                            Join the Beta
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-muted-foreground text-center mt-4">
                        By signing up, you agree to receive product updates and beta 
                        communications from BlanketSmith.
                      </p>
                    </motion.div>
                  </motion.form>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
