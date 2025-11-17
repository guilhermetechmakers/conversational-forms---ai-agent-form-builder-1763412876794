import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Save, Eye, Trash2 } from "lucide-react";
import type { AgentField, FieldType } from "@/types/agent";

export function AgentBuilderPage() {
  const [agentName, setAgentName] = useState("");
  const [agentSlug, setAgentSlug] = useState("");
  const [fields, setFields] = useState<AgentField[]>([]);
  const [selectedField, setSelectedField] = useState<AgentField | null>(null);

  const fieldTypes: { value: FieldType; label: string }[] = [
    { value: 'text', label: 'Text' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'number', label: 'Number' },
    { value: 'select', label: 'Select' },
    { value: 'multi-select', label: 'Multi-Select' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'date', label: 'Date' },
    { value: 'file', label: 'File Upload' },
  ];

  const addField = () => {
    const newField: AgentField = {
      id: `field-${Date.now()}`,
      name: `field_${fields.length + 1}`,
      type: 'text',
      label: 'New Field',
      required: false,
    };
    setFields([...fields, newField]);
    setSelectedField(newField);
  };

  const updateField = (updatedField: AgentField) => {
    setFields(fields.map(f => f.id === updatedField.id ? updatedField : f));
    setSelectedField(updatedField);
  };

  const deleteField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Agent Builder</h1>
            <p className="text-muted-foreground mt-1">
              Create and configure your conversational form agent
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Fields List */}
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Fields</CardTitle>
                  <Button size="sm" onClick={addField}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {fields.map((field) => (
                    <div
                      key={field.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedField?.id === field.id
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedField(field)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{field.label}</p>
                          <p className="text-xs text-muted-foreground">{field.type}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteField(field.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      {field.required && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                  ))}
                  {fields.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No fields yet. Click + to add one.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center - Builder Canvas */}
          <div className="col-span-6">
            <Tabs defaultValue="agent" className="space-y-4">
              <TabsList>
                <TabsTrigger value="agent">Agent Settings</TabsTrigger>
                <TabsTrigger value="persona">Persona</TabsTrigger>
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
                <TabsTrigger value="publish">Publish</TabsTrigger>
              </TabsList>

              <TabsContent value="agent" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="agentName">Agent Name</Label>
                      <Input
                        id="agentName"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        placeholder="My Contact Form"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agentSlug">Slug</Label>
                      <Input
                        id="agentSlug"
                        value={agentSlug}
                        onChange={(e) => setAgentSlug(e.target.value)}
                        placeholder="my-contact-form"
                      />
                      <p className="text-xs text-muted-foreground">
                        Public URL: /a/workspace/{agentSlug || 'slug'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="persona">
                <Card>
                  <CardHeader>
                    <CardTitle>Persona Settings</CardTitle>
                    <CardDescription>
                      Configure your agent's personality and behavior
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Persona Name</Label>
                      <Input placeholder="Assistant" />
                    </div>
                    <div className="space-y-2">
                      <Label>Tagline</Label>
                      <Input placeholder="I'm here to help you complete this form" />
                    </div>
                    <div className="space-y-2">
                      <Label>Instructions</Label>
                      <textarea
                        className="w-full min-h-[200px] p-3 border rounded-md"
                        placeholder="You are a helpful assistant..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appearance">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                      Customize the look and feel of your agent
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <Input type="color" defaultValue="#2563EB" />
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Color</Label>
                      <Input type="color" defaultValue="#10B981" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="knowledge">
                <Card>
                  <CardHeader>
                    <CardTitle>Knowledge Attachments</CardTitle>
                    <CardDescription>
                      Upload documents to provide context to your agent
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Upload Document
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="publish">
                <Card>
                  <CardHeader>
                    <CardTitle>Publish Settings</CardTitle>
                    <CardDescription>
                      Configure webhooks and publish your agent
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Webhook URL</Label>
                      <Input placeholder="https://example.com/webhook" />
                    </div>
                    <Button>Publish Agent</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Field Properties */}
          <div className="col-span-3">
            {selectedField ? (
              <Card>
                <CardHeader>
                  <CardTitle>Field Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Field Label</Label>
                    <Input
                      value={selectedField.label}
                      onChange={(e) =>
                        updateField({ ...selectedField, label: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Field Type</Label>
                    <select
                      className="w-full h-9 px-3 border rounded-md"
                      value={selectedField.type}
                      onChange={(e) =>
                        updateField({
                          ...selectedField,
                          type: e.target.value as FieldType,
                        })
                      }
                    >
                      {fieldTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="required"
                      checked={selectedField.required}
                      onChange={(e) =>
                        updateField({
                          ...selectedField,
                          required: e.target.checked,
                        })
                      }
                    />
                    <Label htmlFor="required">Required field</Label>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Select a field to edit its properties
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
