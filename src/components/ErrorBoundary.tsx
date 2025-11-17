import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Home, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service (e.g., Sentry)
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // In production, you would send this to your error tracking service
    if (import.meta.env.PROD) {
      // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8">
          <Card className="max-w-2xl w-full shadow-card animate-fade-in-up">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto mb-2">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 rounded-full bg-destructive/10">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl md:text-3xl font-semibold">
                  Something Went Wrong
                </CardTitle>
                <CardDescription className="text-base">
                  An unexpected error occurred. Our team has been notified and is working to fix the issue.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {import.meta.env.DEV && this.state.error && (
                <div className="p-4 rounded-lg bg-muted border border-border">
                  <p className="text-sm font-mono text-destructive break-all">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  className="w-full sm:flex-1 btn-hover" 
                  onClick={this.handleReload}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reload Page
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
                  onClick={this.handleReset}
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
