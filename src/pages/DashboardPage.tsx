import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { AgentCard } from "@/components/dashboard/AgentCard";
import { SessionsSummaryWidgets } from "@/components/dashboard/SessionsSummaryWidgets";
import { RecentSessionsTable } from "@/components/dashboard/RecentSessionsTable";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function DashboardPage() {
  const queryClient = useQueryClient();
  const {
    agents,
    recentSessions,
    metrics,
    usage,
    currentPlan,
    agentSessionsCount,
    isLoading,
  } = useDashboardData();

  const cloneAgentMutation = useMutation({
    mutationFn: async (agentId: string) => {
      return api.post<{ id: string }>(`/agents/${agentId}/clone`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success("Agent cloned successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to clone agent");
    },
  });

  const disableAgentMutation = useMutation({
    mutationFn: async (agentId: string) => {
      return api.patch(`/agents/${agentId}`, { status: "archived" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success("Agent disabled");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to disable agent");
    },
  });

  const handleClone = (agentId: string) => {
    cloneAgentMutation.mutate(agentId);
  };

  const handleDisable = (agentId: string) => {
    if (confirm("Are you sure you want to disable this agent?")) {
      disableAgentMutation.mutate(agentId);
    }
  };

  const handleExport = (sessionId: string, format: "csv" | "json") => {
    // TODO: Implement export functionality
    console.log(`Exporting session ${sessionId} as ${format}`);
  };

  const handleResendWebhook = (sessionId: string) => {
    // TODO: Implement webhook resend functionality
    console.log(`Resending webhook for session ${sessionId}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Overview of your conversational forms and sessions
            </p>
          </div>
        </div>

        {/* Sessions Summary Widgets */}
        <SessionsSummaryWidgets
          totalSessions={metrics.totalSessions}
          completedSessions={metrics.completedSessions}
          conversionRate={metrics.conversionRate}
          trendingSources={metrics.trendingSources}
          isLoading={isLoading}
        />

        {/* Agents List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Agents</CardTitle>
                <CardDescription>
                  Manage your conversational form agents
                </CardDescription>
              </div>
              <Link to="/agents/new">
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  New Agent
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 w-full rounded-xl border bg-card animate-pulse" />
                ))}
              </div>
            ) : agents && agents.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {agents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    sessionsCount={agentSessionsCount[agent.id] || 0}
                    onClone={handleClone}
                    onDisable={handleDisable}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No agents yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first conversational form agent to get started
                </p>
                <Link to="/agents/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Agent
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sessions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>
              Latest form completion sessions with visitor metadata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSessionsTable
              sessions={recentSessions}
              isLoading={isLoading}
              onExport={handleExport}
              onResendWebhook={handleResendWebhook}
            />
          </CardContent>
        </Card>

        {/* Footer with Usage & Billing */}
        <DashboardFooter
          currentPlan={currentPlan}
          usage={usage}
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
}
