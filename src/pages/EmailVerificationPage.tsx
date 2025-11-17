import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const [isResending, setIsResending] = useState(false);
  const token = searchParams.get("token");
  const [verified] = useState(!!token);

  const handleResend = async () => {
    setIsResending(true);
    try {
      // TODO: Implement resend verification email API call
      toast.success("Verification email sent! Please check your inbox.");
    } catch (error) {
      toast.error("Failed to send verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <Card>
          <CardHeader className="text-center">
            {verified ? (
              <>
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Email Verified!</CardTitle>
                <CardDescription>
                  Your email has been successfully verified. You can now access your account.
                </CardDescription>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Verify Your Email</CardTitle>
                <CardDescription>
                  We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {!verified && (
              <>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleResend}
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
              </>
            )}
            <Link to={verified ? "/dashboard" : "/login"}>
              <Button className="w-full">
                {verified ? "Go to Dashboard" : "Back to Login"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
