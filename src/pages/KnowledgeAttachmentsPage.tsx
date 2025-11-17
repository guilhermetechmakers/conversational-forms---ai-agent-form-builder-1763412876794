import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadAttachmentDialog } from "@/components/knowledge/UploadAttachmentDialog";
import { AttachmentList } from "@/components/knowledge/AttachmentList";
import { Upload, FileText, BookOpen, Zap } from "lucide-react";
import { useAttachments } from "@/hooks/useKnowledge";

export function KnowledgeAttachmentsPage() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const { data: attachments = [] } = useAttachments();

  const stats = {
    total: attachments.length,
    indexed: attachments.filter((a) => a.status === "indexed").length,
    processing: attachments.filter((a) => a.status === "processing").length,
    error: attachments.filter((a) => a.status === "error").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Knowledge Attachments</h1>
            <p className="text-muted-foreground mt-1">
              Manage documents and FAQs for your conversational agents
            </p>
          </div>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                All uploaded documents
              </p>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Indexed</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.indexed}</div>
              <p className="text-xs text-muted-foreground">
                Ready for retrieval
              </p>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.processing}</div>
              <p className="text-xs text-muted-foreground">
                Currently indexing
              </p>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Errors</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.error}</div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <AttachmentList />

        {/* Upload Dialog */}
        <UploadAttachmentDialog
          open={isUploadDialogOpen}
          onOpenChange={setIsUploadDialogOpen}
        />
      </div>
    </DashboardLayout>
  );
}
