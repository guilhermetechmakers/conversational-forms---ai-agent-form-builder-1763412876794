import { useState, useEffect } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Mail, Loader2, XCircle } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";

const resendVerificationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ResendVerificationFormData = z.infer<typeof resendVerificationSchema>;

export function EmailVerificationPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = searchParams.get("token");
  const emailFromState = location.state?.email as string | undefined;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendVerificationFormData>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: {
      email: emailFromState || "",
    },
  });

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setIsVerifying(true);
    setError(null);
    try {
      await authApi.verifyEmail({ token: verificationToken });
      setVerified(true);
      toast.success("Email verified successfully!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to verify email";
      setError(message);
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async (data: ResendVerificationFormData) => {
    setIsResending(true);
    setError(null);
    try {
      await authApi.resendVerification({ email: data.email });
      toast.success("Verification email sent! Please check your inbox.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send verification email";
      setError(message);
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in-up">
          <Card className="shadow-card">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <CardTitle>Verifying Email</CardTitle>
              <CardDescription>
                Please wait while we verify your email address...
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-2xl font-semibold">Conversational Forms</span>
          </div>
          
          <Card className="shadow-card">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Email Verified!</CardTitle>
              <CardDescription>
                Your email has been successfully verified. You can now access your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/dashboard">
                <Button className="w-full transition-all hover:scale-105 active:scale-95">
                  Go to Dashboard
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-2xl font-semibold">Conversational Forms</span>
        </div>
        
        <Card className="shadow-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Verify Your Email</CardTitle>
            <CardDescription>
              {token
                ? "We're verifying your email address..."
                : "We've sent a verification link to your email address. Please check your inbox and click the link to verify your account."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            
            {!token && (
              <form onSubmit={handleSubmit(handleResend)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full"
                  disabled={isResending}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Resend Verification Email"
                  )}
                </Button>
              </form>
            )}
            
            <Link to="/login">
              <Button className="w-full transition-all hover:scale-105 active:scale-95">
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
