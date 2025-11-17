import { useState } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/otp-input";
import { MessageSquare, Github, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { signInSchema, type SignInFormData } from "@/lib/validations/auth";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: searchParams.get("email") || "",
      password: "",
      totp_code: "",
    },
  });

  const totpCode = watch("totp_code");

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    try {
      const response = await signIn(data);
      
      if ('requires_2fa' in response && response.requires_2fa) {
        setRequires2FA(true);
        setIsLoading(false);
        return;
      }

      // Successful login - check for return URL from location state or search params
      const from = (location.state as { from?: string })?.from;
      const redirectTo = from || searchParams.get("redirect") || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      // Error is already handled in auth context
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setIsOAuthLoading(provider);
    try {
      const { url } = await authApi.initiateOAuth(provider);
      // Redirect to OAuth provider
      window.location.href = url;
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to initiate ${provider} login`;
      toast.error(message);
      setIsOAuthLoading(null);
    }
  };

  const handleOTPComplete = (value: string) => {
    setValue("totp_code", value);
    if (value.length === 6) {
      handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="flex items-center justify-center gap-2 mb-8">
          <MessageSquare className="h-8 w-8 text-primary" />
          <span className="text-2xl font-semibold">Conversational Forms</span>
        </div>
        
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!requires2FA ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-primary hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={totpCode || ""}
                    onChange={handleOTPComplete}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {errors.totp_code && (
                  <p className="text-sm text-destructive text-center">
                    {errors.totp_code.message}
                  </p>
                )}
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setRequires2FA(false)}
                >
                  Back to login
                </Button>
              </div>
            )}
            
            {!requires2FA && (
              <>
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => handleOAuthLogin('google')}
                      disabled={isOAuthLoading !== null}
                      className="transition-all hover:scale-105 active:scale-95"
                    >
                      {isOAuthLoading === 'google' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="currentColor"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          Google
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => handleOAuthLogin('github')}
                      disabled={isOAuthLoading !== null}
                      className="transition-all hover:scale-105 active:scale-95"
                    >
                      {isOAuthLoading === 'github' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Github className="h-4 w-4 mr-2" />
                          GitHub
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
            
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline transition-colors">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
