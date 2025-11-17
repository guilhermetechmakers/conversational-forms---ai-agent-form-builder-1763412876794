import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useTestWebhook } from "@/hooks/useWebhooks";
import type { Webhook } from "@/types/webhook";

interface TestWebhookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhook: Webhook | null;
}

export function TestWebhookDialog({
  open,
  onOpenChange,
  webhook,
}: TestWebhookDialogProps) {
  const [sampleData, setSampleData] = useState<string>("");
  const testMutation = useTestWebhook();

  const handleTest = async () => {
    if (!webhook) return;

    let parsedData: Record<string, unknown> | undefined;
    if (sampleData.trim()) {
      try {
        parsedData = JSON.parse(sampleData);
      } catch {
        // If not valid JSON, treat as plain text
        parsedData = { test_data: sampleData };
      }
    }

    await testMutation.mutateAsync({
      webhook_id: webhook.id,
      sample_data: parsedData,
    });
  };

  const result = testMutation.data;
  const isLoading = testMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Test Webhook</DialogTitle>
          <DialogDescription>
            Send a test payload to verify your webhook configuration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sample-data">Sample Data (JSON, optional)</Label>
            <Textarea
              id="sample-data"
              placeholder='{"session_id": "test-123", "fields": {"name": "John Doe"}}'
              rows={6}
              value={sampleData}
              onChange={(e) => setSampleData(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Optional: Provide sample data to test with. If empty, default test data will be used.
            </p>
          </div>

          {result && (
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                {result.success ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span className="font-semibold text-accent">Test Successful</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-destructive" />
                    <span className="font-semibold text-destructive">Test Failed</span>
                  </>
                )}
              </div>

              {result.status_code && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Status Code:</span>
                  <Badge variant={result.status_code >= 200 && result.status_code < 300 ? "default" : "destructive"}>
                    {result.status_code}
                  </Badge>
                </div>
              )}

              {result.response_body && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Response Body:</Label>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-48">
                    {result.response_body}
                  </pre>
                </div>
              )}

              {result.error_message && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Error:</Label>
                  <div className="flex items-start gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>{result.error_message}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {testMutation.isError && (
            <div className="p-4 border border-destructive rounded-lg bg-destructive/10">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">Error</span>
              </div>
              <p className="text-sm mt-1">
                {testMutation.error instanceof Error
                  ? testMutation.error.message
                  : "An unexpected error occurred"}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleTest} disabled={isLoading || !webhook}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              "Send Test"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
