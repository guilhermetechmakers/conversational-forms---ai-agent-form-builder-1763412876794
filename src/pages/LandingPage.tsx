import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  MessageSquare,
  Zap,
  Shield,
  BarChart3,
  FileText,
  Webhook,
  Check,
  Play,
  ExternalLink,
  Menu,
  X,
  Sparkles,
  Globe,
} from "lucide-react";
import { useTrackCTAClick, useFeatures, useDemos, usePricingTiers } from "@/hooks/useLandingPage";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Form schemas
const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

type SignupFormData = z.infer<typeof signupSchema>;

export function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
  
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const demosRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  const trackCTAClick = useTrackCTAClick();
  const { data: features = [] } = useFeatures();
  const { data: demos = [] } = useDemos();
  const { data: pricingTiers = [] } = usePricingTiers();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  // Data is automatically loaded via useQuery hooks

  // Scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in-up");
        }
      });
    }, observerOptions);

    const refs = [heroRef, featuresRef, demosRef, pricingRef].filter(Boolean);
    refs.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      refs.forEach((ref) => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, []);

  const handleCTAClick = (ctaId: string, ctaText: string, destinationUrl: string) => {
    trackCTAClick.mutate({ ctaId, ctaText, destinationUrl });
  };

  const handleSignup = async (data: SignupFormData) => {
    try {
      // Navigate to signup page with pre-filled data
      navigate("/signup", { state: { email: data.email, name: data.name } });
      setSignupModalOpen(false);
      reset();
      toast.success("Redirecting to signup...");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleDemoClick = (demoUrl: string) => {
    setSelectedDemo(demoUrl);
    setDemoModalOpen(true);
  };

  const handleLaunchDemo = () => {
    if (selectedDemo) {
      window.open(selectedDemo, "_blank");
      setDemoModalOpen(false);
      setSelectedDemo(null);
    }
  };


  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Zap,
    MessageSquare,
    FileText,
    Webhook,
    Shield,
    BarChart3,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2"
              onClick={() => handleCTAClick("nav-logo", "Logo", "/")}
            >
              <div className="relative">
                <MessageSquare className="h-6 w-6 text-primary" />
                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-accent animate-pulse" />
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Conversational Forms
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <a
                href="#features"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => handleCTAClick("nav-features", "Features", "#features")}
              >
                Features
              </a>
              <a
                href="#demos"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => handleCTAClick("nav-demos", "Demos", "#demos")}
              >
                Demos
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => handleCTAClick("nav-pricing", "Pricing", "#pricing")}
              >
                Pricing
              </a>
              <Link
                to="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => handleCTAClick("nav-login", "Login", "/login")}
              >
                Login
              </Link>
              <Dialog open={signupModalOpen} onOpenChange={setSignupModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => handleCTAClick("nav-signup", "Get Started", "/signup")}
                    className="btn-hover"
                  >
                    Get Started
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border py-4 space-y-2 animate-fade-in-down">
              <a
                href="#features"
                className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleCTAClick("nav-features-mobile", "Features", "#features");
                }}
              >
                Features
              </a>
              <a
                href="#demos"
                className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleCTAClick("nav-demos-mobile", "Demos", "#demos");
                }}
              >
                Demos
              </a>
              <a
                href="#pricing"
                className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleCTAClick("nav-pricing-mobile", "Pricing", "#pricing");
                }}
              >
                Pricing
              </a>
              <Link
                to="/login"
                className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleCTAClick("nav-login-mobile", "Login", "/login");
                }}
              >
                Login
              </Link>
              <div className="px-4 pt-2">
                <Button
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSignupModalOpen(true);
                    handleCTAClick("nav-signup-mobile", "Get Started", "/signup");
                  }}
                >
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 animate-gradient-shift opacity-50" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              AI-Powered Form Builder
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent animate-fade-in-up">
              Transform Forms into
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Conversations
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
              Build AI-powered conversational agents that collect structured data through
              natural, engaging chat experiences. Replace static forms with intelligent
              conversations that guide users effortlessly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up animation-delay-400">
              <Dialog open={signupModalOpen} onOpenChange={setSignupModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="btn-hover text-base px-8 py-6"
                    onClick={() => handleCTAClick("hero-signup", "Start Building", "/signup")}
                  >
                    Start Building
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </DialogTrigger>
              </Dialog>
              
              <Button
                size="lg"
                variant="outline"
                className="btn-hover text-base px-8 py-6"
                onClick={() => {
                  handleCTAClick("hero-demo", "Watch Demo", "#demos");
                  document.getElementById("demos")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            {/* Demo GIF/Video Placeholder */}
            <div className="relative max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-border animate-fade-in-up animation-delay-600">
              <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <div className="text-center p-8">
                  <Play className="h-16 w-16 text-primary mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground text-sm">
                    Demo video/GIF placeholder
                  </p>
                  <p className="text-muted-foreground text-xs mt-2">
                    Interactive agent conversation preview
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section
        id="features"
        ref={featuresRef}
        className="py-24 sm:py-32 bg-muted/30"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Everything you need to build
                <br />
                conversational forms
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Powerful features designed to help you create engaging, intelligent
                conversational experiences that convert better than traditional forms.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const IconComponent = feature.icon ? iconMap[feature.icon] : Zap;
                return (
                  <Card
                    key={feature.id}
                    className={cn(
                      "card-hover group",
                      "opacity-0 translate-y-4"
                    )}
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <CardHeader>
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        {IconComponent && (
                          <IconComponent className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Example Agent Demos */}
      <section
        id="demos"
        ref={demosRef}
        className="py-24 sm:py-32"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                See it in action
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore live examples of conversational agents built with our platform.
                Each demo showcases different use cases and capabilities.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {demos.map((demo, index) => (
                <Card
                  key={demo.id}
                  className="card-hover group cursor-pointer"
                  onClick={() => handleDemoClick(demo.demoUrl)}
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                      <MessageSquare className="h-6 w-6 text-accent" />
                    </div>
                    <CardTitle className="text-xl">{demo.title}</CardTitle>
                    <CardDescription className="text-base">
                      {demo.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full group-hover:border-primary group-hover:text-primary transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDemoClick(demo.demoUrl);
                      }}
                    >
                      Try Demo
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section
        id="pricing"
        ref={pricingRef}
        className="py-24 sm:py-32 bg-muted/30"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Start free and scale as you grow. No credit card required for the
                starter plan.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {pricingTiers.map((tier, index) => (
                <Card
                  key={tier.id}
                  className={cn(
                    "card-hover relative",
                    tier.highlighted && "border-primary border-2 shadow-lg scale-105"
                  )}
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {tier.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{tier.tierName}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{tier.price}</span>
                      {tier.price !== "Custom" && (
                        <span className="text-muted-foreground">/month</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={cn(
                        "w-full",
                        tier.highlighted && "bg-primary hover:bg-primary/90"
                      )}
                      variant={tier.highlighted ? "default" : "outline"}
                      onClick={() => {
                        handleCTAClick(`pricing-${tier.id}`, tier.tierName, "/signup");
                        navigate("/signup");
                      }}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
                <span className="font-semibold text-lg">Conversational Forms</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Build better forms with AI-powered conversations. Transform your
                lead generation and data collection with intelligent agents.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/help"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => handleCTAClick("footer-pricing", "Pricing", "#pricing")}
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => handleCTAClick("footer-features", "Features", "#features")}
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#demos"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => handleCTAClick("footer-demos", "Demos", "#demos")}
                  >
                    Demos
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => handleCTAClick("footer-about", "About", "#")}
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => handleCTAClick("footer-contact", "Contact", "#")}
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => handleCTAClick("footer-careers", "Careers", "#")}
                  >
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/privacy-terms"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => handleCTAClick("footer-privacy", "Privacy & Terms", "/privacy-terms")}
                  >
                    Privacy & Terms
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cookies"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              © {new Date().getFullYear()} Conversational Forms. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Signup Modal */}
      <Dialog open={signupModalOpen} onOpenChange={setSignupModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Your Account</DialogTitle>
            <DialogDescription>
              Get started with Conversational Forms and build your first AI agent in minutes.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleSignup)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                {...register("name")}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSignupModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Demo Interaction Modal */}
      <Dialog open={demoModalOpen} onOpenChange={setDemoModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Try the Demo</DialogTitle>
            <DialogDescription>
              This demo will open in a new tab so you can interact with the conversational
              agent while keeping this page open for reference.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                The demo showcases a real conversational agent built with our platform.
                You can interact with it naturally, and it will guide you through
                collecting information conversationally.
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDemoModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleLaunchDemo}>
                Launch Demo
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
