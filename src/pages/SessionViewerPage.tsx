import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Send } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Session } from "@/types/session";

export function SessionViewerPage() {
  const { id } = useParams<{ id: string }>();
  
  const { data: session, isLoading } = useQuery({
    queryKey: ['session', id],
    queryFn: () => api.get<Session>(`/sessions/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div>Loading...</div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return (
      <DashboardLayout>
        <div>Session not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Session Details</h1>
            <p className="text-muted-foreground mt-1">
              View transcript and parsed fields for this session
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Resend Webhook
            </Button>
          </div>
        </div>

        {/* Session Info */}
        <Card>
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Session ID</p>
                <p className="font-mono text-sm">{session.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                  {session.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm">
                  {new Date(session.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-sm">
                  {session.completed_at
                    ? new Date(session.completed_at).toLocaleString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="transcript" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
            <TabsTrigger value="fields">Parsed Fields</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
          </TabsList>

          <TabsContent value="transcript">
            <Card>
              <CardHeader>
                <CardTitle>Conversation Transcript</CardTitle>
                <CardDescription>
                  Full conversation history between the agent and visitor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {session.transcript.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary/10 ml-8'
                          : message.role === 'assistant'
                          ? 'bg-muted mr-8'
                          : 'bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold uppercase">
                          {message.role}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fields">
            <Card>
              <CardHeader>
                <CardTitle>Parsed Fields</CardTitle>
                <CardDescription>
                  Structured data extracted from the conversation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {session.parsed_fields.map((field) => (
                    <div
                      key={field.field_id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">{field.field_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {typeof field.value === 'object'
                            ? JSON.stringify(field.value)
                            : String(field.value)}
                        </p>
                      </div>
                      <Badge
                        variant={field.validated ? 'default' : 'destructive'}
                      >
                        {field.validated ? 'Valid' : 'Invalid'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metadata">
            <Card>
              <CardHeader>
                <CardTitle>Session Metadata</CardTitle>
                <CardDescription>
                  Additional information about this session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {session.metadata.referrer && (
                    <div>
                      <p className="text-sm text-muted-foreground">Referrer</p>
                      <p className="text-sm">{session.metadata.referrer}</p>
                    </div>
                  )}
                  {session.metadata.utm_source && (
                    <div>
                      <p className="text-sm text-muted-foreground">UTM Source</p>
                      <p className="text-sm">{session.metadata.utm_source}</p>
                    </div>
                  )}
                  {session.metadata.utm_campaign && (
                    <div>
                      <p className="text-sm text-muted-foreground">UTM Campaign</p>
                      <p className="text-sm">{session.metadata.utm_campaign}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
