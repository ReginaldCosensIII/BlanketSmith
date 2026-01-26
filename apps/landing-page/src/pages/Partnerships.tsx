import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Store, Users, Palette, CheckCircle2, ArrowRight, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const partnerTypes = [
  {
    id: "creator",
    icon: Users,
    title: "Content Creator",
    description: "YouTubers, bloggers, social media influencers",
  },
  {
    id: "designer",
    icon: Palette,
    title: "Pattern Designer",
    description: "Independent designers and pattern publishers",
  },
  {
    id: "business",
    icon: Store,
    title: "Business / Brand",
    description: "Yarn shops, craft brands, and retailers",
  },
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

export default function Partnerships() {
  const [selectedType, setSelectedType] = useState<string>("creator");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast({
      title: "Partnership inquiry submitted!",
      description: "We'll review your proposal and get back to you soon.",
    });
  };

  if (isSubmitted) {
    return (
      <Layout>
        <section className="py-16 lg:py-24 relative">
          <div className="absolute inset-0 radial-gradient-wash pointer-events-none" aria-hidden="true" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="max-w-xl mx-auto text-center"
            >
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-brand-purple via-brand-midblue to-brand-cyan flex items-center justify-center"
              >
                <CheckCircle2 className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-4">
                Thank you for reaching out!
              </h1>
              <p className="text-muted-foreground mb-8">
                We've received your partnership inquiry and are excited to explore 
                potential collaboration. Our team will review your submission and 
                respond within 3-5 business days.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="gradient" size="lg" asChild>
                  <a href="/">
                    <Home className="w-4 h-4" />
                    Back to Home
                  </a>
                </Button>
                <Button 
                  size="lg"
                  className="bg-background text-foreground hover:bg-background/90 hover:scale-[1.02] active:scale-[0.98] shadow-lg border border-border"
                  onClick={() => setIsSubmitted(false)}
                >
                  Submit another inquiry
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-16 lg:py-24 relative">
        <div className="absolute inset-0 radial-gradient-wash pointer-events-none" aria-hidden="true" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Partner with BlanketSmith
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                We're building partnerships with creators, designers, and businesses 
                who share our passion for empowering makers. Let's create something 
                meaningful together.
              </p>
            </div>

            {/* Partner Type Selection */}
            <div className="grid sm:grid-cols-3 gap-4 mb-10">
              {partnerTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedType(type.id)}
                  className={`group p-5 rounded-xl text-left transition-all glass ${
                    selectedType === type.id
                      ? "!border-primary !bg-primary/10 ring-2 ring-primary/20"
                      : "hover:border-primary/30"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-all duration-300 ease-out ${
                    selectedType === type.id 
                      ? "bg-gradient-to-br from-brand-purple via-brand-midblue to-brand-cyan" 
                      : "bg-gradient-to-br from-brand-midblue/10 to-brand-cyan/10 border border-brand-purple/30 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(92,174,255,0.4)] group-hover:border-brand-midblue/50"
                  }`}>
                    <type.icon className={`w-5 h-5 ${selectedType === type.id ? "text-white" : "text-brand-midblue"}`} />
                  </div>
                  <h3 className="font-medium text-foreground mb-1">{type.title}</h3>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </button>
              ))}
            </div>

            {/* Form */}
            <motion.form 
              onSubmit={handleSubmit}
              className="rounded-2xl glass p-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} className="grid sm:grid-cols-2 gap-4 mb-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Your name</Label>
                  <Input 
                    id="name" 
                    placeholder="Jane Maker" 
                    required 
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="jane@example.com" 
                    required 
                    maxLength={255}
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="grid sm:grid-cols-2 gap-4 mb-5">
                <div className="space-y-2">
                  <Label htmlFor="company">Company / Brand name</Label>
                  <Input 
                    id="company" 
                    placeholder="Your brand or channel name"
                    required 
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website / Social link</Label>
                  <Input 
                    id="website" 
                    type="url" 
                    placeholder="https://..."
                    maxLength={500}
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2 mb-5">
                <Label htmlFor="audience">
                  {selectedType === "creator" 
                    ? "Tell us about your audience" 
                    : selectedType === "designer"
                    ? "Tell us about your design work"
                    : "Tell us about your business"
                  }
                </Label>
                <Textarea 
                  id="audience"
                  placeholder={
                    selectedType === "creator"
                      ? "Describe your platform, audience size, and content focus..."
                      : selectedType === "designer"
                      ? "Share your design style, published patterns, and where you sell..."
                      : "Tell us about your business, products, and customer base..."
                  }
                  className="min-h-[120px]"
                  required
                  maxLength={1000}
                />
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2 mb-5">
                <Label htmlFor="proposal">Partnership ideas</Label>
                <Textarea 
                  id="proposal"
                  placeholder="What kind of collaboration are you envisioning? How can we work together to serve the maker community?"
                  className="min-h-[150px]"
                  required
                  maxLength={2000}
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
                    "Submitting..."
                  ) : (
                    <>
                      Submit Partnership Inquiry
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  We typically respond to partnership inquiries within 3-5 business days.
                </p>
              </motion.div>
            </motion.form>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
