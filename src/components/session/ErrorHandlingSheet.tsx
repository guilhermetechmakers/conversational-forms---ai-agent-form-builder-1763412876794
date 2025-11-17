import { AlertTriangle, RefreshCw, MessageSquare, User } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ErrorHandlingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  error: Error | null;
  onRetry?: () => void;
  onManualInput?: () => void;
  onEscalate?: () => void;
  fallbackMessage?: string;
}

export function ErrorHandlingSheet({
  open,
  onOpenChange,
  error,
  onRetry,
  onManualInput,
  onEscalate,
  fallbackMessage,
}: ErrorHandlingSheetProps) {
  const displayMessage = error?.message || fallbackMessage || "An unexpected error occurred";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Session Error
          </DialogTitle>
          <DialogDescription>
            We encountered an issue processing your request. Please choose an option below.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-4">
            {/* Error Details */}
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Error Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">{displayMessage}</p>
                {error && import.meta.env.DEV && (
                  <>
                    <Separator className="my-3" />
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground mb-2">
                        Technical Details
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                        {error.stack || error.toString()}
                      </pre>
                    </details>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Fallback Options */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">What would you like to do?</h3>
              
              {/* Retry Option */}
              {onRetry && (
                <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <RefreshCw className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold mb-1">Retry Request</h4>
                        <p className="text-xs text-muted-foreground">
                          Try sending your message again. This may resolve temporary connection issues.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onRetry}
                        className="flex-shrink-0"
                      >
                        Retry
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Manual Input Option */}
              {onManualInput && (
                <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="h-5 w-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold mb-1">Manual Input</h4>
                        <p className="text-xs text-muted-foreground">
                          Enter your information manually using a traditional form interface.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onManualInput}
                        className="flex-shrink-0"
                      >
                        Use Form
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Escalate Option */}
              {onEscalate && (
                <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold mb-1">Contact Support</h4>
                        <p className="text-xs text-muted-foreground">
                          Get help from a human agent who can assist you with completing this session.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onEscalate}
                        className="flex-shrink-0"
                      >
                        Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Need help?</strong> If none of these options work, please contact our support team 
                or try refreshing the page. Your session data is saved and you can continue where you left off.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
