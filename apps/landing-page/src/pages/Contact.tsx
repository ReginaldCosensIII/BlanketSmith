import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/SharedComponents";
import { useToast } from "@/hooks/use-toast";

const contactReasons = [
  {
    id: "general",
    icon: 'contact-general',
    title: "General Inquiry",
    description: "Questions about BlanketSmith",
  },
  {
    id: "support",
    icon: 'contact-support',
    title: "Support",
    description: "Help with your account or the app",
  },
  {
    id: "other",
    icon: 'contact-other',
    title: "Other",
    description: "Anything else on your mind",
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

export default function Contact() {
  const [selectedReason, setSelectedReason] = useState<string>("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const subject = formData.get("subject") as string;
      const message = formData.get("message") as string;

      // Dynamic import
      const { supabase } = await import("@blanketsmith/supabase");

      const { error } = await supabase.from("contact_submissions").insert({
        category: "contact",
        sub_type: selectedReason,
        email,
        full_name: name,
        message, // Direct column mapping
        metadata: {
          subject
        }
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      });
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        variant: "destructive",
        title: "Something went wrong.",
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
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
                <Icon name="check-circle" size={48} className="text-white" />
              </motion.div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-4">
                Message received!
              </h1>
              <p className="text-muted-foreground mb-8">
                Thank you for reaching out. We'll review your message and respond
                as quickly as possible—typically within 1-2 business days.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="gradient" size="lg" asChild>
                  <a href="/">
                    <Icon name="home" className="w-4 h-4" />
                    Back to Home
                  </a>
                </Button>
                <Button
                  size="lg"
                  className="bg-background text-foreground hover:bg-background/90 hover:scale-[1.02] active:scale-[0.98] shadow-lg border border-border"
                  onClick={() => setIsSubmitted(false)}
                >
                  Send another message
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
            className="max-w-3xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Get in Touch
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Have a question or just want to say hello? We'd love to hear from you.
                Fill out the form below and we'll get back to you shortly.
              </p>
            </div>

            {/* Reason Selection */}
            <div className="grid sm:grid-cols-3 gap-4 mb-10">
              {contactReasons.map((reason) => (
                <button
                  key={reason.id}
                  type="button"
                  onClick={() => setSelectedReason(reason.id)}
                  className={`group p-5 rounded-xl text-left transition-all glass ${selectedReason === reason.id
                    ? "!border-primary !bg-primary/10 ring-2 ring-primary/20"
                    : "hover:border-primary/30"
                    }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-all duration-300 ease-out ${selectedReason === reason.id
                    ? "bg-gradient-to-br from-brand-purple via-brand-midblue to-brand-cyan"
                    : "bg-gradient-to-br from-brand-midblue/10 to-brand-cyan/10 border border-brand-purple/30 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(92,174,255,0.4)] group-hover:border-brand-midblue/50"
                    }`}>
                    <Icon name={reason.icon} className={`w-5 h-5 ${selectedReason === reason.id ? "text-white" : "text-brand-midblue"}`} />
                  </div>
                  <h3 className="font-medium text-foreground mb-1">{reason.title}</h3>
                  <p className="text-xs text-muted-foreground">{reason.description}</p>
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
                    name="name"
                    placeholder="Jane Maker"
                    required
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="jane@example.com"
                    required
                    maxLength={255}
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2 mb-5">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="What's this about?"
                  required
                  maxLength={200}
                />
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2 mb-5">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us what's on your mind..."
                  className="min-h-[180px]"
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
                    "Sending..."
                  ) : (
                    <>
                      Send Message
                      <Icon name="arrow-right" className="w-4 h-4" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  We typically respond within 1-2 business days.
                </p>
              </motion.div>
            </motion.form>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
