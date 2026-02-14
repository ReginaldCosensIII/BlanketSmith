import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/SharedComponents";
import { useToast } from "@/hooks/use-toast";

const feedbackTypes = [
  {
    id: "bug",
    icon: 'bug',
    title: "Bug Report",
    description: "Something isn't working as expected",
  },
  {
    id: "feature",
    icon: 'lightbulb',
    title: "Feature Request",
    description: "Suggest a new feature or improvement",
  },
  {
    id: "general",
    icon: 'feedback-general',
    title: "General Feedback",
    description: "Share your thoughts and experience",
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

export default function Feedback() {
  const [selectedType, setSelectedType] = useState<string>("bug");
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
      const title = formData.get("title") as string;

      let metadata: any = {
        feedbackType: selectedType,
        title
      };

      if (selectedType === "bug") {
        // metadata.steps_to_reproduce and expected_behavior moved to top-level
        // metadata.browser stays in metadata? User said: "Ensure 'primary_craft', 'experience_level', 'steps_to_reproduce', and 'expected_behavior' are sent as top-level keys"
        // So browser stays in metadata.
        metadata.browser = formData.get("browser") as string;
      } else {
        metadata.details = formData.get("details") as string;
      }

      // Dynamic import
      const { supabase } = await import("@blanketsmith/supabase");

      const submissionPayload: any = {
        category: "feedback",
        sub_type: selectedType,
        email,
        full_name: name,
        metadata
      };

      if (selectedType === "bug") {
        submissionPayload.steps_to_reproduce = formData.get("steps") as string;
        submissionPayload.expected_behavior = formData.get("expected") as string;
      }

      const { error } = await supabase.from("contact_submissions").insert(submissionPayload);

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Feedback submitted!",
        description: "Thank you for helping us improve BlanketSmith.",
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
                Thank you for your feedback!
              </h1>
              <p className="text-muted-foreground mb-8">
                Your input helps us build a better tool for the maker community.
                We review every submission and will follow up if we need more details.
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
                  Submit more feedback
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
                Beta Feedback & Bug Reports
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Your feedback directly shapes BlanketSmith. Report bugs, suggest features,
                or share your experience—we read everything.
              </p>
            </div>

            {/* Feedback Type Selection */}
            <div className="grid sm:grid-cols-3 gap-4 mb-10">
              {feedbackTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedType(type.id)}
                  className={`group p-5 rounded-xl text-left transition-all glass ${selectedType === type.id
                    ? "!border-primary !bg-primary/10 ring-2 ring-primary/20"
                    : "hover:border-primary/30"
                    }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-all duration-300 ease-out ${selectedType === type.id
                    ? "bg-gradient-to-br from-brand-purple via-brand-midblue to-brand-cyan"
                    : "bg-gradient-to-br from-brand-midblue/10 to-brand-cyan/10 border border-brand-purple/30 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(92,174,255,0.4)] group-hover:border-brand-midblue/50"
                    }`}>
                    <Icon name={type.icon} className={`w-5 h-5 ${selectedType === type.id ? "text-white" : "text-brand-midblue"}`} />
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
                <Label htmlFor="title">
                  {selectedType === "bug"
                    ? "Brief description of the issue"
                    : selectedType === "feature"
                      ? "Feature title"
                      : "Subject"
                  }
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder={
                    selectedType === "bug"
                      ? "e.g., Pattern export fails on large designs"
                      : selectedType === "feature"
                        ? "e.g., Add color palette suggestions"
                        : "e.g., My experience with the pattern editor"
                  }
                  required
                  maxLength={200}
                />
              </motion.div>

              {selectedType === "bug" ? (
                <>
                  <motion.div variants={itemVariants} className="space-y-2 mb-5">
                    <Label htmlFor="steps">Steps to reproduce</Label>
                    <Textarea
                      id="steps"
                      name="steps"
                      placeholder="1. Go to... 2. Click on..."
                      className="min-h-[100px]"
                      required
                      maxLength={2000}
                    />
                  </motion.div>
                  <motion.div variants={itemVariants} className="space-y-2 mb-5">
                    <Label htmlFor="expected">Expected behavior</Label>
                    <Textarea
                      id="expected"
                      name="expected"
                      placeholder="What did you expect to happen?"
                      className="min-h-[80px]"
                      required
                      maxLength={1000}
                    />
                  </motion.div>
                </>
              ) : (
                <motion.div variants={itemVariants} className="space-y-2 mb-5">
                  <Label htmlFor="details">
                    Details
                  </Label>
                  <Textarea
                    id="details"
                    name="details"
                    placeholder={
                      selectedType === "feature"
                        ? "Describe the feature and how it would help your workflow..."
                        : "Share your thoughts, suggestions, or experience..."
                    }
                    className="min-h-[180px]"
                    required
                    maxLength={2000}
                  />
                </motion.div>
              )}

              {selectedType === "bug" && (
                <motion.div variants={itemVariants} className="space-y-2 mb-5">
                  <Label htmlFor="browser">Browser & device (optional)</Label>
                  <Input
                    id="browser"
                    name="browser"
                    placeholder="e.g., Chrome on MacBook Pro"
                    maxLength={100}
                  />
                </motion.div>
              )}

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
                      Submit Feedback
                      <Icon name="arrow-right" className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.form>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
