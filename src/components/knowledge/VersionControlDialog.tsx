import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, RotateCcw, CheckCircle2 } from "lucide-react";
import { useAttachmentVersions, useRestoreVersion } from "@/hooks/useKnowledge";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface VersionControlDialogProps {
  attachmentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VersionControlDialog({
  attachmentId,
  open,
  onOpenChange,
}: VersionControlDialogProps) {
  const { data: versions, isLoading } = useAttachmentVersions(attachmentId || undefined);
  const restoreMutation = useRestoreVersion();

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleRestore = async (version: number) => {
    if (!attachmentId) return;
    
    if (confirm(`Are you sure you want to restore version ${version}? This will replace the current version.`)) {
      try {
        await restoreMutation.mutateAsync({ id: attachmentId, version });
        onOpenChange(false);
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Version History
          </DialogTitle>
          <DialogDescription>
            View and restore previous versions of this document
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : versions && versions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>File Size</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Indexed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versions.map((version, index) => {
                  const isCurrent = index === 0;
                  return (
                    <TableRow key={version.version}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">v{version.version}</span>
                          {isCurrent && (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Current
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatFileSize(version.file_size)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {version.indexed_at
                          ? formatDistanceToNow(new Date(version.indexed_at), { addSuffix: true })
                          : "Not indexed"}
                      </TableCell>
                      <TableCell className="text-right">
                        {!isCurrent && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestore(version.version)}
                            disabled={restoreMutation.isPending}
                            className="gap-2"
                          >
                            <RotateCcw className={cn("h-4 w-4", restoreMutation.isPending && "animate-spin")} />
                            Restore
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No version history available</p>
            </div>
          )}
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
