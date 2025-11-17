import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import type { Agent } from "@/types/agent";

interface PreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: Agent | null;
  workspaceSlug?: string;
}

export function PreviewModal({
  open,
  onOpenChange,
  agent,
  workspaceSlug = "workspace",
}: PreviewModalProps) {
  if (!agent) return null;

  const previewUrl = `${window.location.origin}/a/${workspaceSlug}/${agent.slug}?preview=true`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Preview Agent</DialogTitle>
          <DialogDescription>
            Preview how your agent will appear to visitors
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground mb-2">
              Preview URL:
            </p>
            <code className="text-xs break-all">{previewUrl}</code>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.open(previewUrl, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
