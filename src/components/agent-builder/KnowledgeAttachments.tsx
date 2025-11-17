import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileText, X, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import type { KnowledgeAttachment } from "@/types/knowledge";
import { cn } from "@/lib/utils";

interface KnowledgeAttachmentsProps {
  attachments: KnowledgeAttachment[];
  onUpload: (file: File) => void;
  onDelete: (id: string) => void;
  onReindex: (id: string) => void;
}

const statusConfig = {
  pending: { label: "Pending", icon: Loader2, color: "text-muted-foreground" },
  processing: { label: "Processing", icon: RefreshCw, color: "text-primary animate-spin" },
  indexed: { label: "Indexed", icon: CheckCircle2, color: "text-accent" },
  error: { label: "Error", icon: AlertCircle, color: "text-destructive" },
};

export function KnowledgeAttachments({
  attachments,
  onUpload,
  onDelete,
  onReindex,
}: KnowledgeAttachmentsProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => {
      if (file.type.startsWith("text/") || file.type === "application/pdf") {
        onUpload(file);
      }
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (file.type.startsWith("text/") || file.type === "application/pdf") {
        onUpload(file);
      }
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Knowledge Attachments</CardTitle>
        <CardDescription>
          Upload documents to provide context to your agent
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          )}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">Drop files here or click to upload</p>
          <p className="text-xs text-muted-foreground mb-4">
            Supports PDF, TXT, MD, and other text files
          </p>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.txt,.md,.doc,.docx"
            multiple
            onChange={handleFileSelect}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Select Files
          </Button>
        </div>

        {attachments.length > 0 && (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {attachments.map((attachment) => {
                const status = statusConfig[attachment.status];
                const StatusIcon = status.icon;
                return (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {attachment.filename}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className={cn("text-xs", status.color)}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(attachment.file_size)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {attachment.status === "indexed" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onReindex(attachment.id)}
                          title="Re-index"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onDelete(attachment.id)}
                        title="Delete"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {attachments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No attachments yet. Upload documents to provide context to your agent.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
