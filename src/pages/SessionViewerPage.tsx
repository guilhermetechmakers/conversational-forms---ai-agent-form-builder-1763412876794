import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { sessionApi } from "@/lib/api/session";
import { SessionHeader } from "@/components/session/SessionHeader";
import { TranscriptPanel } from "@/components/session/TranscriptPanel";
import { ParsedFieldsCard } from "@/components/session/ParsedFieldsCard";
import { ActionsPanel } from "@/components/session/ActionsPanel";
import { NotesAndTagsSection } from "@/components/session/NotesAndTagsSection";
import { ActivityLog } from "@/components/session/ActivityLog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SessionWithDetails } from "@/types/session";

export function SessionViewerPage() {
  const { id } = useParams<{ id: string }>();
  
  const { data: session, isLoading, error } = useQuery<SessionWithDetails>({
    queryKey: ['session', id],
    queryFn: () => sessionApi.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !session) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold">Session Not Found</h1>
              <p className="text-muted-foreground">
                The session you're looking for doesn't exist or you don't have access to it.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <div className="font-semibold text-destructive">Error</div>
              <div className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'Failed to load session'}
              </div>
            </div>
          </div>
          <Link to="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Back Button */}
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Session Header */}
        <SessionHeader session={session} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="transcript" className="space-y-4">
              <TabsList>
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
                <TabsTrigger value="fields">Parsed Fields</TabsTrigger>
              </TabsList>

              <TabsContent value="transcript" className="space-y-4">
                <TranscriptPanel messages={session.transcript} />
              </TabsContent>

              <TabsContent value="fields" className="space-y-4">
                <ParsedFieldsCard fields={session.parsed_fields} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <ActionsPanel
              sessionId={session.id}
              sessionName={session.agent?.name}
              parsedFields={session.parsed_fields}
            />
            <NotesAndTagsSection
              sessionId={session.id}
              notes={session.notes}
              tags={session.tags}
              assigneeId={session.assignee_id}
              assigneeName={session.assignee_name}
              leadScore={session.lead_score}
            />
            <ActivityLog
              activities={session.activities}
              webhookDeliveries={session.webhook_deliveries}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
