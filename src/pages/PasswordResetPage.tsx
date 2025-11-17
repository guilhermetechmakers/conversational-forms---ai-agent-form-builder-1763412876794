import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength";
import { MessageSquare, Loader2, CheckCircle2, Eye, EyeOff, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { passwordResetSchema, type PasswordResetFormData } from "@/lib/validations/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function PasswordResetPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      token: token || "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const onSubmit = async (data: PasswordResetFormData) => {
    if (!token) {
      toast.error("Invalid reset token", {
        description: "Please request a new password reset link.",
      });
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({
        token,
        password: data.password,
      });
      setIsSuccess(true);
      toast.success("Password reset successfully!", {
        description: "You can now sign in with your new password.",
      });
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to reset password";
      toast.error("Unable to reset password", {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="flex items-center justify-center gap-2 mb-8">
            <MessageSquare className="h-8 w-8 text-primary" />
            <span className="text-2xl font-semibold">Conversational Forms</span>
          </div>
          
          <Card className="shadow-card hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto mb-2 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
              <CardDescription className="text-base">
                This password reset link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground text-center">
                  Password reset links expire after 1 hour for security reasons. Please request a new link to continue.
                </p>
              </div>
              <Link to="/forgot-password">
                <Button className="w-full transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-md">
                  Request a new reset link
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost" className="w-full transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="flex items-center justify-center gap-2 mb-8">
            <MessageSquare className="h-8 w-8 text-primary" />
            <span className="text-2xl font-semibold">Conversational Forms</span>
          </div>
          
          <Card className="shadow-card hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto mb-2 h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center animate-scale-in">
                <CheckCircle2 className="h-10 w-10 text-accent" />
              </div>
              <CardTitle className="text-2xl">Password Reset Successful</CardTitle>
              <CardDescription className="text-base">
                Your password has been reset successfully. You can now sign in with your new password.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground text-center">
                  Redirecting to login page in a few seconds...
                </p>
              </div>
              <Link to="/login">
                <Button className="w-full transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-md">
                  <Lock className="mr-2 h-4 w-4" />
                  Go to login
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
          <MessageSquare className="h-8 w-8 text-primary" />
          <span className="text-2xl font-semibold">Conversational Forms</span>
        </div>
        
        <Card className="shadow-card hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="space-y-4">
            <div className="mx-auto mb-2 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-2xl">Set new password</CardTitle>
              <CardDescription className="text-base">
                Enter your new password below. Make sure it meets all security requirements.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    {...register("password")}
                    className={cn(
                      "transition-all focus:ring-2 focus:ring-primary/20 pr-10",
                      errors.password ? "border-destructive focus:border-destructive" : ""
                    )}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 rounded"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {errors.password.message}
                  </p>
                )}
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-3 p-4 bg-muted/50 rounded-lg border border-border">
                    <PasswordStrengthIndicator password={password} />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    {...register("confirmPassword")}
                    className={cn(
                      "transition-all focus:ring-2 focus:ring-primary/20 pr-10",
                      errors.confirmPassword ? "border-destructive focus:border-destructive" : 
                      confirmPassword && password === confirmPassword ? "border-accent/50" : ""
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 rounded"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {errors.confirmPassword.message}
                  </p>
                )}
                {confirmPassword && password === confirmPassword && !errors.confirmPassword && (
                  <p className="text-sm text-accent flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                    Passwords match
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
                    Resetting password...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Reset password
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-center text-sm text-muted-foreground">
                <Link 
                  to="/login" 
                  className="text-primary hover:underline transition-colors font-medium inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
