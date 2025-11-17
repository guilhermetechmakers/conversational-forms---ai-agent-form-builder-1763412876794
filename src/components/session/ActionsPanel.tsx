import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Send, UserPlus, Trash2 } from "lucide-react";
import { ExportDialog } from "./ExportDialog";
import { ResendWebhookModal } from "./ResendWebhookModal";
import { CreateCRMContactForm } from "./CreateCRMContactForm";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import type { ParsedField } from "@/types/session";

interface ActionsPanelProps {
  sessionId: string;
  sessionName?: string;
  parsedFields: ParsedField[];
}

export function ActionsPanel({ sessionId, sessionName, parsedFields }: ActionsPanelProps) {
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [webhookModalOpen, setWebhookModalOpen] = useState(false);
  const [crmModalOpen, setCrmModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>
            Export data, manage webhooks, and perform other actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setExportDialogOpen(true)}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Session
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setWebhookModalOpen(true)}
          >
            <Send className="mr-2 h-4 w-4" />
            Resend Webhook
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setCrmModalOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Create CRM Contact
          </Button>
          <Button
            variant="destructive"
            className="w-full justify-start"
            onClick={() => setDeleteModalOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Session
          </Button>
        </CardContent>
      </Card>

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        sessionId={sessionId}
        sessionName={sessionName}
      />
      <ResendWebhookModal
        open={webhookModalOpen}
        onOpenChange={setWebhookModalOpen}
        sessionId={sessionId}
      />
      <CreateCRMContactForm
        open={crmModalOpen}
        onOpenChange={setCrmModalOpen}
        sessionId={sessionId}
        parsedFields={parsedFields}
      />
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        sessionId={sessionId}
        sessionName={sessionName}
      />
    </>
  );
}
