import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Calendar,
  HardDrive,
} from "lucide-react";
import { useDeleteAttachment, useReindexAttachment } from "@/hooks/useKnowledge";
import type { KnowledgeAttachment } from "@/types/knowledge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const statusConfig = {
  pending: { label: "Pending", icon: Loader2, color: "text-muted-foreground", variant: "secondary" as const },
  processing: { label: "Processing", icon: RefreshCw, color: "text-primary", variant: "default" as const },
  indexed: { label: "Indexed", icon: CheckCircle2, color: "text-accent", variant: "default" as const },
  error: { label: "Error", icon: AlertCircle, color: "text-destructive", variant: "destructive" as const },
};

interface AttachmentManagementDialogProps {
  attachment: KnowledgeAttachment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVersionHistory?: () => void;
}

export function AttachmentManagementDialog({
  attachment,
  open,
  onOpenChange,
  onVersionHistory,
}: AttachmentManagementDialogProps) {
  const deleteMutation = useDeleteAttachment();
  const reindexMutation = useReindexAttachment();

  if (!attachment) return null;

  const status = statusConfig[attachment.status];
  const StatusIcon = status.icon;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this document? This action cannot be undone.")) {
      try {
        await deleteMutation.mutateAsync(attachment.id);
        onOpenChange(false);
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

  const handleReindex = async () => {
    try {
      await reindexMutation.mutateAsync(attachment.id);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Details
          </DialogTitle>
          <DialogDescription>
            View and manage document information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">File Name</h3>
              <Badge variant={status.variant} className={cn("gap-1", status.color)}>
                <StatusIcon className={cn("h-3 w-3", attachment.status === "processing" && "animate-spin")} />
                {status.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground break-all">{attachment.filename}</p>
          </div>

          <Separator />

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <HardDrive className="h-4 w-4" />
                File Size
              </div>
              <p className="text-sm font-medium">{formatFileSize(attachment.file_size)}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                File Type
              </div>
              <p className="text-sm font-medium">{attachment.file_type}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Created
              </div>
              <p className="text-sm font-medium">
                {formatDistanceToNow(new Date(attachment.created_at), { addSuffix: true })}
              </p>
            </div>
            {attachment.indexed_at && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Indexed
                </div>
                <p className="text-sm font-medium">
                  {formatDistanceToNow(new Date(attachment.indexed_at), { addSuffix: true })}
                </p>
              </div>
            )}
          </div>

          {attachment.error_message && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  Error Message
                </div>
                <p className="text-sm text-muted-foreground bg-destructive/10 p-3 rounded-md">
                  {attachment.error_message}
                </p>
              </div>
            </>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            {attachment.status === "indexed" && (
              <Button
                variant="outline"
                onClick={handleReindex}
                disabled={reindexMutation.isPending}
                className="flex-1"
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", reindexMutation.isPending && "animate-spin")} />
                Re-index
              </Button>
            )}
            {onVersionHistory && (
              <Button
                variant="outline"
                onClick={onVersionHistory}
                className="flex-1"
              >
                <Clock className="h-4 w-4 mr-2" />
                Version History
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
