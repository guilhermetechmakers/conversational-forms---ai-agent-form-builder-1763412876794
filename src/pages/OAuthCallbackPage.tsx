import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function OAuthCallbackPage() {
  const { provider } = useParams<{ provider: 'google' | 'github' }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      if (!provider || (provider !== 'google' && provider !== 'github')) {
        setError('Invalid OAuth provider');
        setStatus('error');
        return;
      }

      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError(errorParam);
        setStatus('error');
        return;
      }

      if (!code) {
        setError('Missing authorization code');
        setStatus('error');
        return;
      }

      try {
        const response = await authApi.handleOAuthCallback(provider, code, state || undefined);
        
        // Store tokens if provided
        if (response.token) {
          localStorage.setItem('auth_token', response.token);
        }
        if (response.refresh_token) {
          localStorage.setItem('refresh_token', response.refresh_token);
        }

        // If 2FA is required, redirect to login with 2FA prompt
        if (response.requires_2fa) {
          toast.info('Please complete 2FA verification');
          navigate('/login', { state: { requires_2fa: true, email: response.user.email } });
          return;
        }

        setStatus('success');
        toast.success('Successfully signed in!');
        
        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to complete OAuth login';
        setError(message);
        setStatus('error');
        toast.error(message);
      }
    };

    handleCallback();
  }, [provider, searchParams, navigate, signIn]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in-up">
          <Card className="shadow-card">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <CardTitle>Completing Sign In</CardTitle>
              <CardDescription>
                Please wait while we complete your {provider} sign in...
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in-up">
          <Card className="shadow-card">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle>Sign In Failed</CardTitle>
              <CardDescription>
                {error || 'An error occurred during sign in'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <button
                onClick={() => navigate('/login')}
                className="w-full rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium transition-all hover:scale-105 active:scale-95"
              >
                Back to Login
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <Card className="shadow-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Sign In Successful</CardTitle>
            <CardDescription>
              Redirecting to dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
