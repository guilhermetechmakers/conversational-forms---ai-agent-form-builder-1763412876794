import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/otp-input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Github, Loader2, Eye, EyeOff, Shield, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { signInSchema, signUpSchema, type SignInFormData, type SignUpFormData } from "@/lib/validations/auth";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { signIn, signUp } = useAuth();
  
  // Determine initial mode from URL path or search params, default to login
  const getInitialMode = (): "login" | "signup" => {
    if (location.pathname === "/signup" || searchParams.get("mode") === "signup") {
      return "signup";
    }
    return "login";
  };
  
  const [mode, setMode] = useState<"login" | "signup">(getInitialMode());
  
  // Update mode when route changes
  useEffect(() => {
    const newMode = getInitialMode();
    setMode(newMode);
    setRequires2FA(false);
    setCaptchaVerified(false);
  }, [location.pathname, searchParams]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  // Login form
  const loginForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: searchParams.get("email") || "",
      password: "",
      totp_code: "",
    },
  });

  // Signup form
  const signupForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      full_name: "",
    },
  });

  const totpCode = loginForm.watch("totp_code");

  const handleLogin = async (data: SignInFormData) => {
    setIsLoading(true);
    try {
      const response = await signIn(data);
      
      if ('requires_2fa' in response && response.requires_2fa) {
        setRequires2FA(true);
        setIsLoading(false);
        return;
      }

      // Successful login
      const from = (location.state as { from?: string })?.from;
      const redirectTo = from || searchParams.get("redirect") || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      await signUp({
        email: data.email,
        password: data.password,
        full_name: data.full_name || undefined,
      });
      navigate("/verify-email", { state: { email: data.email } });
    } catch (error) {
      // Error is already handled in auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setIsOAuthLoading(provider);
    try {
      const { url } = await authApi.initiateOAuth(provider);
      window.location.href = url;
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to initiate ${provider} login`;
      toast.error(message);
      setIsOAuthLoading(null);
    }
  };

  const handleOTPComplete = (value: string) => {
    loginForm.setValue("totp_code", value);
    if (value.length === 6) {
      loginForm.handleSubmit(handleLogin)();
    }
  };

  const toggleMode = () => {
    const newMode = mode === "login" ? "signup" : "login";
    setMode(newMode);
    setRequires2FA(false);
    setCaptchaVerified(false);
    // Navigate to the appropriate route
    navigate(newMode === "login" ? "/login" : "/signup", { replace: true });
  };

  // CAPTCHA verification handler (placeholder - integrate with actual CAPTCHA service)
  const handleCaptchaVerify = (token: string | null) => {
    setCaptchaVerified(!!token);
  };

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
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {mode === "login" ? "Welcome back" : "Create an account"}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {mode === "login"
                      ? "Sign in to your account to continue"
                      : "Get started with Conversational Forms today"}
                  </CardDescription>
                </div>
              </div>
              
              {/* Mode Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${mode === "login" ? "text-foreground" : "text-muted-foreground"}`}>
                    Sign in
                  </span>
                  <Switch
                    checked={mode === "signup"}
                    onCheckedChange={toggleMode}
                    aria-label="Toggle between sign in and sign up"
                  />
                  <span className={`text-sm font-medium ${mode === "signup" ? "text-foreground" : "text-muted-foreground"}`}>
                    Sign up
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {!requires2FA ? (
                <>
                  {mode === "login" ? (
                    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="you@example.com"
                          {...loginForm.register("email")}
                          className={loginForm.formState.errors.email ? "border-destructive" : ""}
                        />
                        {loginForm.formState.errors.email && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {loginForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            {...loginForm.register("password")}
                            className={loginForm.formState.errors.password ? "border-destructive" : ""}
                          />
                        </div>
                        {loginForm.formState.errors.password && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {loginForm.formState.errors.password.message}
                          </p>
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
                        className="w-full transition-all hover:scale-105 active:scale-95" 
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
                    <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Full Name</Label>
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="John Doe"
                          {...signupForm.register("full_name")}
                          className={signupForm.formState.errors.full_name ? "border-destructive" : ""}
                        />
                        {signupForm.formState.errors.full_name && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {signupForm.formState.errors.full_name.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          {...signupForm.register("email")}
                          className={signupForm.formState.errors.email ? "border-destructive" : ""}
                        />
                        {signupForm.formState.errors.email && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {signupForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...signupForm.register("password")}
                            className={signupForm.formState.errors.password ? "border-destructive pr-10" : "pr-10"}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {signupForm.formState.errors.password && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {signupForm.formState.errors.password.message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Must be at least 8 characters with uppercase, lowercase, number, and special character
                        </p>
                      </div>

                      {/* CAPTCHA Placeholder */}
                      <div className="space-y-2">
                        <Label>Security Verification</Label>
                        <div className="flex items-center justify-center p-4 border border-border rounded-md bg-muted/50">
                          <div className="text-center space-y-2">
                            <Shield className="h-8 w-8 mx-auto text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              CAPTCHA verification will be integrated here
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleCaptchaVerify("mock-token")}
                              className="text-xs"
                            >
                              Verify (Demo)
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full transition-all hover:scale-105 active:scale-95" 
                        disabled={isLoading || (mode === "signup" && !captchaVerified)}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          "Create account"
                        )}
                      </Button>
                    </form>
                  )}

                  {/* Social Login */}
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
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
                  {loginForm.formState.errors.totp_code && (
                    <p className="text-sm text-destructive text-center flex items-center justify-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {loginForm.formState.errors.totp_code.message}
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
            </CardContent>

            {/* Security Notice */}
            <CardFooter className="flex flex-col space-y-3 pt-6 border-t border-border">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">Security Notice</p>
                  <p>
                    Your data is encrypted and secure. We use industry-standard security practices 
                    to protect your information. By continuing, you agree to our Terms of Service 
                    and Privacy Policy.
                  </p>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span>Secure authentication</span>
            </div>
            <nav className="flex items-center gap-6">
              <Link to="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/help" className="hover:text-foreground transition-colors">
                Help Center
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
