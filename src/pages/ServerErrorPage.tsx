import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Home, ArrowLeft, RefreshCw, AlertCircle, Mail, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supportApi } from "@/lib/api/support";

const contactSupportSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactSupportFormData = z.infer<typeof contactSupportSchema>;

export function ServerErrorPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactSupportFormData>({
    resolver: zodResolver(contactSupportSchema),
    defaultValues: {
      email: "",
      subject: "Server Error Report",
      message: "",
    },
  });

  const onSubmit = async (data: ContactSupportFormData) => {
    setIsSubmitting(true);
    try {
      await supportApi.contact({
        ...data,
        error_type: "500",
        page_url: window.location.href,
        user_agent: navigator.userAgent,
      });
      
      toast.success("Thank you! Your message has been sent. We'll get back to you soon.");
      reset();
      setShowContactForm(false);
    } catch (error) {
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Failed to send message. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8">
      <div className="max-w-2xl w-full space-y-8 animate-fade-in-up">
        {/* Main Error Card */}
        <Card className="shadow-card hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto mb-2">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 rounded-full bg-destructive/10">
                  <AlertCircle className="h-12 w-12 text-destructive" />
                </div>
              </div>
              <div className="text-8xl md:text-9xl font-bold text-muted-foreground/20 leading-none">
                500
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl md:text-3xl font-semibold">
                Server Error
              </CardTitle>
              <CardDescription className="text-base">
                We're sorry, but something went wrong on our end. Our team has been notified and is working to fix the issue.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                className="w-full sm:flex-1 btn-hover" 
                onClick={handleRetry}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
              <Link to="/" className="flex-1">
                <Button variant="outline" className="w-full btn-hover">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full sm:flex-1 btn-hover" 
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
            
            {!showContactForm && (
              <div className="pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowContactForm(true)}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Support Form */}
        {showContactForm && (
          <Card className="shadow-card animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Support
              </CardTitle>
              <CardDescription>
                Help us fix this issue by providing details about what you were doing when the error occurred.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    {...register("email")}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of the issue"
                    {...register("subject")}
                    className={errors.subject ? "border-destructive" : ""}
                  />
                  {errors.subject && (
                    <p className="text-sm text-destructive">{errors.subject.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Please describe what you were doing when this error occurred..."
                    rows={5}
                    {...register("message")}
                    className={errors.message ? "border-destructive" : ""}
                  />
                  {errors.message && (
                    <p className="text-sm text-destructive">{errors.message.message}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    className="flex-1 btn-hover"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowContactForm(false);
                      reset();
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Helpful Links */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="card-hover cursor-pointer">
            <Link to="/dashboard">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Home className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Dashboard</CardTitle>
                    <CardDescription className="text-xs">
                      Return to your workspace
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>
          
          <Card className="card-hover cursor-pointer">
            <Link to="/">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <AlertCircle className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Help Center</CardTitle>
                    <CardDescription className="text-xs">
                      Get help and support
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
