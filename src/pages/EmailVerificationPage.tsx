import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Mail, Loader2, XCircle, MessageSquare, Shield, AlertCircle, ArrowLeft } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const resendVerificationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ResendVerificationFormData = z.infer<typeof resendVerificationSchema>;

export function EmailVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendModalOpen, setResendModalOpen] = useState(false);
  const token = searchParams.get("token");
  const emailFromState = location.state?.email as string | undefined;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ResendVerificationFormData>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: {
      email: emailFromState || "",
    },
  });

  const verifyEmail = useCallback(async (verificationToken: string) => {
    setIsVerifying(true);
    setError(null);
    try {
      await authApi.verifyEmail({ token: verificationToken });
      setVerified(true);
      toast.success("Email verified successfully!", {
        description: "You can now access all features of your account.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to verify email";
      setError(message);
      toast.error("Verification failed", {
        description: message,
      });
    } finally {
      setIsVerifying(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token, verifyEmail]);

  const handleResend = async (data: ResendVerificationFormData) => {
    setIsResending(true);
    setError(null);
    try {
      await authApi.resendVerification({ email: data.email });
      toast.success("Verification email sent!", {
        description: "Please check your inbox and click the link to verify your account.",
      });
      setResendModalOpen(false);
      reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send verification email";
      setError(message);
      toast.error("Unable to send verification email", {
        description: message,
      });
    } finally {
      setIsResending(false);
    }
  };

  // Loading state while verifying
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <MessageSquare className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold">Conversational Forms</span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md animate-fade-in-up">
            <Card className="shadow-card hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto mb-2 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center animate-scale-in">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
                <CardTitle className="text-2xl">Verifying Email</CardTitle>
                <CardDescription className="text-base">
                  Please wait while we verify your email address...
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>Secure verification</span>
              </div>
              <nav className="flex items-center gap-6">
                <Link to="/help" className="hover:text-foreground transition-colors">
                  Help Center
                </Link>
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </nav>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Success state after verification
  if (verified) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <MessageSquare className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold">Conversational Forms</span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-4 py-8">
          <div className="w-full max-w-md animate-fade-in-up">
            <Card className="shadow-card hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto mb-2 h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center animate-scale-in">
                  <CheckCircle2 className="h-10 w-10 text-accent" />
                </div>
                <CardTitle className="text-2xl">Email Verified!</CardTitle>
                <CardDescription className="text-base">
                  Your email has been successfully verified. You can now access all features of your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="w-full transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-md"
                >
                  Go to Dashboard
                </Button>
                <Link to="/login">
                  <Button variant="ghost" className="w-full transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>Secure verification</span>
              </div>
              <nav className="flex items-center gap-6">
                <Link to="/help" className="hover:text-foreground transition-colors">
                  Help Center
                </Link>
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </nav>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Default state (no token or verification failed)
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <MessageSquare className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">Conversational Forms</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md animate-fade-in-up">
          <Card className="shadow-card hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto mb-2 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl">Verify Your Email</CardTitle>
                <CardDescription className="text-base">
                  {token
                    ? "We're verifying your email address..."
                    : "We've sent a verification link to your email address. Please check your inbox and click the link to verify your account."}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive mb-1">Verification Failed</p>
                    <p className="text-sm text-destructive/80">{error}</p>
                  </div>
                </div>
              )}

              {!token && (
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-muted-foreground text-center">
                      Didn't receive the email? Check your spam folder or request a new verification email.
                    </p>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full transition-all hover:scale-[1.02] active:scale-[0.98] hover:bg-muted"
                    onClick={() => setResendModalOpen(true)}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </Button>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/login")}
                  className="w-full transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-md"
                >
                  Back to Login
                </Button>
                <Link to="/">
                  <Button variant="ghost" className="w-full transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Return to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span>Secure verification</span>
            </div>
            <nav className="flex items-center gap-6">
              <Link to="/help" className="hover:text-foreground transition-colors">
                Help Center
              </Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>
      </footer>

      {/* Resend Verification Modal */}
      <Dialog open={resendModalOpen} onOpenChange={setResendModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resend Verification Email</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a new verification link.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleResend)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resend-email">Email address</Label>
              <Input
                id="resend-email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className={cn(
                  "transition-all focus:ring-2 focus:ring-primary/20",
                  errors.email ? "border-destructive focus:border-destructive" : ""
                )}
                autoFocus
              />
              {errors.email && (
                <p className="text-sm text-destructive flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {errors.email.message}
                </p>
              )}
            </div>
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setResendModalOpen(false);
                  setError(null);
                  reset();
                }}
                disabled={isResending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isResending}>
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Verification Email
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
