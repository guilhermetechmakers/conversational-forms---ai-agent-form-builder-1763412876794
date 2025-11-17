import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { sessionApi } from "@/lib/api/session";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface ResendWebhookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
}

export function ResendWebhookModal({ open, onOpenChange, sessionId }: ResendWebhookModalProps) {
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string } | null>(null);
  const queryClient = useQueryClient();

  const handleResend = async () => {
    setIsSending(true);
    setResult(null);
    try {
      await sessionApi.resendWebhook(sessionId);
      setResult({ success: true, message: 'Webhook sent successfully' });
      toast.success('Webhook resent successfully');
      
      // Invalidate session query to refresh data
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
      
      // Close after a delay
      setTimeout(() => {
        onOpenChange(false);
        setResult(null);
      }, 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resend webhook';
      setResult({ success: false, message });
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Resend Webhook</DialogTitle>
          <DialogDescription>
            This will trigger a new webhook delivery for this session
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {result ? (
            <div className={`flex items-center gap-3 p-4 rounded-lg ${
              result.success ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'
            }`}>
              {result.success ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <div>
                <div className="font-semibold">
                  {result.success ? 'Success' : 'Failed'}
                </div>
                <div className="text-sm opacity-90">{result.message}</div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Are you sure you want to resend the webhook for this session? This action will trigger a new delivery attempt.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => {
            onOpenChange(false);
            setResult(null);
          }} disabled={isSending}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          {!result && (
            <Button onClick={handleResend} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Resend Webhook
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
