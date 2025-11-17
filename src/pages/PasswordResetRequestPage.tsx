import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Mail, Loader2, CheckCircle2, ArrowLeft, AlertCircle } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { passwordResetRequestSchema, type PasswordResetRequestFormData } from "@/lib/validations/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function PasswordResetRequestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetRequestFormData>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: PasswordResetRequestFormData) => {
    setIsLoading(true);
    try {
      await authApi.requestPasswordReset(data);
      setEmail(data.email);
      setIsSuccess(true);
      toast.success("Password reset email sent!", {
        description: "Please check your inbox for further instructions.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send reset email";
      toast.error("Unable to send reset email", {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <MessageSquare className="h-8 w-8 text-primary" />
            <span className="text-2xl font-semibold">Conversational Forms</span>
          </div>
          
          <Card className="shadow-card hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto mb-2 h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center animate-scale-in">
                <CheckCircle2 className="h-10 w-10 text-accent" />
              </div>
              <CardTitle className="text-2xl">Check your email</CardTitle>
              <CardDescription className="text-base">
                We've sent a password reset link to
              </CardDescription>
              <div className="pt-2">
                <p className="text-sm font-medium text-foreground bg-muted px-4 py-2 rounded-md inline-block">
                  {email}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-muted-foreground text-center">
                  Click the link in the email to reset your password. The link will expire in <strong>1 hour</strong>.
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              </div>
              
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full transition-all hover:scale-[1.02] active:scale-[0.98] hover:bg-muted"
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail("");
                  }}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send another email
                </Button>
                <Link to="/login">
                  <Button variant="ghost" className="w-full transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <MessageSquare className="h-8 w-8 text-primary" />
          <span className="text-2xl font-semibold">Conversational Forms</span>
        </div>
        
        <Card className="shadow-card hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="space-y-4">
            <div className="mx-auto mb-2 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-2xl">Reset your password</CardTitle>
              <CardDescription className="text-base">
                Enter your email address and we'll send you a link to reset your password
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email address
                </Label>
                <Input
                  id="email"
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
                  <p className="text-sm text-destructive flex items-center gap-1.5 mt-1">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {errors.email.message}
                  </p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-md" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send reset link
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link 
                  to="/login" 
                  className="text-primary hover:underline transition-colors font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
