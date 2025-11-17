import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Eye, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAgent, useCreateAgent, useUpdateAgent, usePublishAgent, useUnpublishAgent } from "@/hooks/useAgent";
import { FieldPalette } from "@/components/agent-builder/FieldPalette";
import { VisualFlowEditor } from "@/components/agent-builder/VisualFlowEditor";
import { FieldEditor } from "@/components/agent-builder/FieldEditor";
import { PersonaSettings } from "@/components/agent-builder/PersonaSettings";
import { KnowledgeAttachments } from "@/components/agent-builder/KnowledgeAttachments";
import { AppearanceSettings } from "@/components/agent-builder/AppearanceSettings";
import { PublishControls } from "@/components/agent-builder/PublishControls";
import { PreviewModal } from "@/components/agent-builder/PreviewModal";
import { VersionHistory } from "@/components/agent-builder/VersionHistory";
import type { AgentField, AgentPersona, AgentAppearance, FieldType } from "@/types/agent";
import type { KnowledgeAttachment } from "@/types/knowledge";

const defaultPersona: AgentPersona = {
  name: "Assistant",
  tagline: "I'm here to help you complete this form",
  tone: "friendly",
  instructions: "You are a helpful assistant that collects information through conversation. Be polite, clear, and guide users through the form fields one at a time.",
};

const defaultAppearance: AgentAppearance = {
  primary_color: "#2563EB",
  secondary_color: "#10B981",
  font_family: "Inter",
};

export function AgentBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: existingAgent, isLoading } = useAgent(id);
  const createAgent = useCreateAgent();
  const updateAgent = useUpdateAgent(id || "");
  const publishAgent = usePublishAgent(id || "");
  const unpublishAgent = useUnpublishAgent(id || "");

  // State
  const [agentName, setAgentName] = useState("");
  const [agentSlug, setAgentSlug] = useState("");
  const [fields, setFields] = useState<AgentField[]>([]);
  const [selectedField, setSelectedField] = useState<AgentField | null>(null);
  const [persona, setPersona] = useState<AgentPersona>(defaultPersona);
  const [appearance, setAppearance] = useState<AgentAppearance>(defaultAppearance);
  const [attachments, setAttachments] = useState<KnowledgeAttachment[]>([]);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [enableCaptcha, setEnableCaptcha] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load existing agent data
  useEffect(() => {
    if (existingAgent) {
      setAgentName(existingAgent.name);
      setAgentSlug(existingAgent.slug);
      setFields(existingAgent.fields || []);
      setPersona(existingAgent.persona || defaultPersona);
      setAppearance(existingAgent.appearance || defaultAppearance);
      setLastSaved(new Date(existingAgent.updated_at));
    }
  }, [existingAgent]);

  // Autosave functionality with toast feedback
  const autosave = useCallback(async () => {
    if (!agentName || !agentSlug || fields.length === 0) {
      return;
    }

    if (!isEditing || !id) {
      // For new agents, we'll save on explicit save action
      return;
    }

    try {
      const agentData = {
        name: agentName,
        slug: agentSlug,
        fields,
        persona,
        appearance,
        knowledge_refs: attachments.map((a) => a.id),
      };

      await updateAgent.mutateAsync(agentData);
      setLastSaved(new Date());
    } catch (error) {
      // Silently fail for autosave - errors are handled by mutation
      console.error("Autosave failed:", error);
    }
  }, [agentName, agentSlug, fields, persona, appearance, attachments, isEditing, id, updateAgent]);

  // Autosave debounced with better feedback
  useEffect(() => {
    if (!isEditing || !id) return;

    const timer = setTimeout(() => {
      autosave();
    }, 3000); // Increased to 3 seconds to reduce API calls

    return () => clearTimeout(timer);
  }, [agentName, agentSlug, fields, persona, appearance, isEditing, autosave]);

  const handleAddField = (type: FieldType) => {
    const newField: AgentField = {
      id: `field-${Date.now()}`,
      name: `field_${fields.length + 1}`,
      type,
      label: `New ${type} Field`,
      placeholder: `Enter ${type}`,
      required: false,
    };
    const updatedFields = [...fields, newField];
    setFields(updatedFields);
    setSelectedField(newField);
  };

  const handleUpdateField = (updatedField: AgentField) => {
    const updatedFields = fields.map((f) =>
      f.id === updatedField.id ? updatedField : f
    );
    setFields(updatedFields);
    setSelectedField(updatedField);
    toast.success("Field updated");
  };

  const handleDeleteField = (fieldId: string) => {
    const updatedFields = fields.filter((f) => f.id !== fieldId);
    setFields(updatedFields);
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
    toast.success("Field deleted");
  };

  const handleReorderFields = (reorderedFields: AgentField[]) => {
    setFields(reorderedFields);
    toast.success("Fields reordered");
  };

  const handleSave = async () => {
    if (!agentName.trim()) {
      toast.error("Agent name is required");
      return;
    }

    if (!agentSlug.trim()) {
      toast.error("Slug is required");
      return;
    }

    if (fields.length === 0) {
      toast.error("At least one field is required");
      return;
    }

    try {
      const agentData = {
        name: agentName,
        slug: agentSlug,
        fields,
        persona,
        appearance,
        knowledge_refs: attachments.map((a) => a.id),
      };

      if (isEditing && id) {
        await updateAgent.mutateAsync(agentData);
        toast.success("Agent saved successfully");
      } else {
        const newAgent = await createAgent.mutateAsync(agentData);
        navigate(`/agents/${newAgent.id}/edit`);
        toast.success("Agent created successfully");
      }

      setLastSaved(new Date());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save agent");
    }
  };

  const handlePublish = async () => {
    if (!id) {
      toast.error("Please save the agent first");
      return;
    }

    try {
      await publishAgent.mutateAsync();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleUnpublish = async () => {
    if (!id) {
      return;
    }

    try {
      await unpublishAgent.mutateAsync();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleUploadAttachment = async (file: File) => {
    // TODO: Implement actual file upload
    const newAttachment: KnowledgeAttachment = {
      id: `attachment-${Date.now()}`,
      workspace_id: "workspace-1",
      filename: file.name,
      file_type: file.type,
      file_size: file.size,
      file_url: URL.createObjectURL(file),
      status: "pending",
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setAttachments([...attachments, newAttachment]);
    toast.success("File uploaded successfully");
  };

  const handleDeleteAttachment = (attachmentId: string) => {
    setAttachments(attachments.filter((a) => a.id !== attachmentId));
    toast.success("Attachment deleted");
  };

  const handleReindexAttachment = (attachmentId: string) => {
    setAttachments(
      attachments.map((a) =>
        a.id === attachmentId ? { ...a, status: "processing" as const } : a
      )
    );
    toast.success("Re-indexing started");
    // TODO: Implement actual re-indexing
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading agent...</p>
        </div>
      </DashboardLayout>
    );
  }

  const agentForPreview: any = {
    id: id || "preview",
    name: agentName || "Preview Agent",
    slug: agentSlug || "preview",
    fields,
    persona,
    appearance,
    status: existingAgent?.status || "draft",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-semibold">
                {isEditing ? "Edit Agent" : "Create Agent"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isEditing
                  ? "Modify your conversational form agent"
                  : "Build a new conversational form agent"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lastSaved && (
              <span className="text-xs text-muted-foreground">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <Button variant="outline" onClick={() => setPreviewOpen(true)}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button onClick={handleSave} disabled={createAgent.isPending || updateAgent.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {createAgent.isPending || updateAgent.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Left Sidebar - Field Palette */}
          <div className="col-span-3">
            <FieldPalette onAddField={handleAddField} />
          </div>

          {/* Center - Visual Flow Editor & Settings */}
          <div className="col-span-6 flex flex-col">
            <Tabs defaultValue="flow" className="flex-1 flex flex-col">
              <TabsList className="mb-4">
                <TabsTrigger value="flow">Flow</TabsTrigger>
                <TabsTrigger value="agent">Agent Settings</TabsTrigger>
                <TabsTrigger value="persona">Persona</TabsTrigger>
                <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                <TabsTrigger value="publish">Publish</TabsTrigger>
                {isEditing && id && (
                  <TabsTrigger value="versions">Versions</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="flow" className="flex-1 flex flex-col mt-0">
                <VisualFlowEditor
                  fields={fields}
                  selectedField={selectedField}
                  onSelectField={setSelectedField}
                  onDeleteField={handleDeleteField}
                  onReorderFields={handleReorderFields}
                />
              </TabsContent>

              <TabsContent value="agent" className="flex-1 overflow-y-auto mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Configure the basic settings for your agent
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="agentName">Agent Name *</Label>
                      <Input
                        id="agentName"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        placeholder="My Contact Form"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agentSlug">Slug *</Label>
                      <Input
                        id="agentSlug"
                        value={agentSlug}
                        onChange={(e) => setAgentSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                        placeholder="my-contact-form"
                      />
                      <p className="text-xs text-muted-foreground">
                        Public URL: /a/workspace/{agentSlug || "slug"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="persona" className="flex-1 overflow-y-auto mt-0">
                <PersonaSettings
                  persona={persona}
                  onUpdate={setPersona}
                />
              </TabsContent>

              <TabsContent value="knowledge" className="flex-1 overflow-y-auto mt-0">
                <KnowledgeAttachments
                  attachments={attachments}
                  onUpload={handleUploadAttachment}
                  onDelete={handleDeleteAttachment}
                  onReindex={handleReindexAttachment}
                />
              </TabsContent>

              <TabsContent value="appearance" className="flex-1 overflow-y-auto mt-0">
                <AppearanceSettings
                  appearance={appearance}
                  onUpdate={setAppearance}
                />
              </TabsContent>

              <TabsContent value="publish" className="flex-1 overflow-y-auto mt-0">
                <PublishControls
                  slug={agentSlug}
                  status={existingAgent?.status || "draft"}
                  webhookUrl={webhookUrl}
                  enableCaptcha={enableCaptcha}
                  onSlugChange={setAgentSlug}
                  onPublish={handlePublish}
                  onUnpublish={handleUnpublish}
                  onWebhookChange={setWebhookUrl}
                  onCaptchaToggle={setEnableCaptcha}
                />
              </TabsContent>

              {isEditing && id && (
                <TabsContent value="versions" className="flex-1 overflow-y-auto mt-0">
                  <VersionHistory agentId={id} />
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Right Sidebar - Field Properties */}
          <div className="col-span-3">
            <FieldEditor
              field={selectedField}
              onUpdate={handleUpdateField}
              onDelete={handleDeleteField}
              allFields={fields}
            />
          </div>
        </div>
      </div>

      <PreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        agent={agentForPreview}
      />
    </DashboardLayout>
  );
}
