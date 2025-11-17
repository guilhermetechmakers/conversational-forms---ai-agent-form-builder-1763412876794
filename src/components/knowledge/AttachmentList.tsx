import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Search,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useAttachments } from "@/hooks/useKnowledge";
import { AttachmentManagementDialog } from "./AttachmentManagementDialog";
import { VersionControlDialog } from "./VersionControlDialog";
import type { KnowledgeAttachment } from "@/types/knowledge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusConfig = {
  pending: { label: "Pending", icon: Loader2, color: "text-muted-foreground", variant: "secondary" as const },
  processing: { label: "Processing", icon: RefreshCw, color: "text-primary", variant: "default" as const },
  indexed: { label: "Indexed", icon: CheckCircle2, color: "text-accent", variant: "default" as const },
  error: { label: "Error", icon: AlertCircle, color: "text-destructive", variant: "destructive" as const },
};

interface AttachmentListProps {
  agentId?: string;
}

export function AttachmentList({ agentId }: AttachmentListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAttachment, setSelectedAttachment] = useState<KnowledgeAttachment | null>(null);
  const [isManagementDialogOpen, setIsManagementDialogOpen] = useState(false);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);

  const { data: attachments = [], isLoading } = useAttachments({
    agent_id: agentId,
    status: statusFilter !== "all" ? (statusFilter as KnowledgeAttachment["status"]) : undefined,
  });

  const filteredAttachments = attachments.filter((attachment) =>
    attachment.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleViewDetails = (attachment: KnowledgeAttachment) => {
    setSelectedAttachment(attachment);
    setIsManagementDialogOpen(true);
  };

  const handleVersionHistory = (attachment: KnowledgeAttachment) => {
    setSelectedAttachment(attachment);
    setIsVersionDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Manage your knowledge base documents
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="indexed">Indexed</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredAttachments.length > 0 ? (
            <div className="space-y-2">
              {filteredAttachments.map((attachment) => {
                const status = statusConfig[attachment.status];
                const StatusIcon = status.icon;
                return (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold truncate">{attachment.filename}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={status.variant}
                            className={cn("text-xs gap-1", status.color)}
                          >
                            <StatusIcon className={cn("h-3 w-3", attachment.status === "processing" && "animate-spin")} />
                            {status.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(attachment.file_size)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            • {attachment.file_type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(attachment)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleVersionHistory(attachment)}>
                          Version History
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No documents found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Upload your first document to get started"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AttachmentManagementDialog
        attachment={selectedAttachment}
        open={isManagementDialogOpen}
        onOpenChange={setIsManagementDialogOpen}
        onVersionHistory={() => {
          setIsManagementDialogOpen(false);
          if (selectedAttachment) {
            handleVersionHistory(selectedAttachment);
          }
        }}
      />

      <VersionControlDialog
        attachmentId={selectedAttachment?.id || null}
        open={isVersionDialogOpen}
        onOpenChange={setIsVersionDialogOpen}
      />
    </>
  );
}
