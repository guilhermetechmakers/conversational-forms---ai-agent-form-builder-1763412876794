import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Webhook as WebhookIcon, Activity } from "lucide-react";
import { useWebhooks } from "@/hooks/useWebhooks";
import { WebhookCard } from "@/components/webhooks/WebhookCard";
import { WebhookFormModal } from "@/components/webhooks/WebhookFormModal";
import { FieldMappingModal } from "@/components/webhooks/FieldMappingModal";
import { TestWebhookDialog } from "@/components/webhooks/TestWebhookDialog";
import { DeliveryLogsTable } from "@/components/webhooks/DeliveryLogsTable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteWebhook } from "@/hooks/useWebhooks";
import { useUpdateWebhook } from "@/hooks/useWebhooks";
import { useAgents } from "@/hooks/useAgent";
import type { Webhook } from "@/types/webhook";

export function WebhooksPage() {
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [fieldMappingModalOpen, setFieldMappingModalOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);

  const { data: webhooks, isLoading } = useWebhooks();
  const { data: agents } = useAgents();
  const deleteMutation = useDeleteWebhook();
  const updateMutation = useUpdateWebhook();

  const handleEdit = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setFormModalOpen(true);
  };

  const handleDelete = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setDeleteDialogOpen(true);
  };

  const handleTest = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setTestDialogOpen(true);
  };

  const handleFieldMapping = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setFieldMappingModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedWebhook) {
      deleteMutation.mutate(selectedWebhook.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSelectedWebhook(null);
        },
      });
    }
  };

  const handleFieldMappingSave = (mappings: Record<string, string>) => {
    if (selectedWebhook) {
      updateMutation.mutate(
        {
          id: selectedWebhook.id,
          input: { field_mapping: mappings },
        },
        {
          onSuccess: () => {
            setFieldMappingModalOpen(false);
            setSelectedWebhook(null);
          },
        }
      );
    }
  };

  // Get available fields from agents
  const availableFields = agents
    ? agents.flatMap((agent) =>
        agent.fields.map((field) => ({
          id: field.id,
          name: field.label || field.name,
          type: field.type,
        }))
      )
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Webhooks & Integrations</h1>
            <p className="text-muted-foreground mt-1">
              Manage webhook endpoints and monitor delivery status
            </p>
          </div>
          <Button onClick={() => {
            setSelectedWebhook(null);
            setFormModalOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Webhook
          </Button>
        </div>

        <Tabs defaultValue="webhooks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="webhooks">
              <WebhookIcon className="h-4 w-4 mr-2" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            ) : webhooks && webhooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {webhooks.map((webhook) => (
                  <WebhookCard
                    key={webhook.id}
                    webhook={webhook}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onTest={handleTest}
                    onFieldMapping={handleFieldMapping}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <WebhookIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No webhooks yet</h3>
                  <p className="text-muted-foreground text-center mb-4 max-w-md">
                    Create your first webhook to start receiving session data automatically
                  </p>
                  <Button onClick={() => {
                    setSelectedWebhook(null);
                    setFormModalOpen(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Webhook
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Logs</CardTitle>
                <CardDescription>
                  Monitor webhook delivery attempts and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DeliveryLogsTable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <WebhookFormModal
          open={formModalOpen}
          onOpenChange={setFormModalOpen}
          webhook={selectedWebhook}
          onSuccess={() => {
            setSelectedWebhook(null);
          }}
        />

        {selectedWebhook && (
          <>
            <FieldMappingModal
              open={fieldMappingModalOpen}
              onOpenChange={setFieldMappingModalOpen}
              webhook={selectedWebhook}
              availableFields={availableFields}
              onSave={handleFieldMappingSave}
            />

            <TestWebhookDialog
              open={testDialogOpen}
              onOpenChange={setTestDialogOpen}
              webhook={selectedWebhook}
            />
          </>
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Webhook</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this webhook? This action cannot be undone.
                Future session completions will no longer trigger this webhook.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
