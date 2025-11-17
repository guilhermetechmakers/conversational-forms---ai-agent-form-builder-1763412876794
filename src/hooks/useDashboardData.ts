import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Agent } from "@/types/agent";
import type { Session } from "@/types/session";

interface DashboardMetrics {
  totalSessions: number;
  completedSessions: number;
  conversionRate: number;
  trendingSources: Array<{ source: string; count: number }>;
}

interface DashboardUsage {
  sessions: number;
  sessionsLimit: number;
  agents: number;
  agentsLimit: number;
}

export function useDashboardData() {
  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: () => api.get<Agent[]>("/agents"),
  });

  const { data: recentSessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["sessions", "recent"],
    queryFn: () => api.get<Session[]>("/sessions?limit=10"),
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["dashboard", "metrics"],
    queryFn: () => api.get<DashboardMetrics>("/dashboard/metrics"),
    initialData: {
      totalSessions: 0,
      completedSessions: 0,
      conversionRate: 0,
      trendingSources: [],
    },
  });

  const { data: usage, isLoading: usageLoading } = useQuery({
    queryKey: ["dashboard", "usage"],
    queryFn: () => api.get<DashboardUsage>("/dashboard/usage"),
    initialData: {
      sessions: 0,
      sessionsLimit: 100,
      agents: 0,
      agentsLimit: 5,
    },
  });

  const { data: currentPlan = "Free" } = useQuery({
    queryKey: ["dashboard", "plan"],
    queryFn: () => api.get<{ plan: string }>("/dashboard/plan"),
    select: (data) => data.plan,
  });

  // Calculate sessions count per agent
  const agentSessionsCount = recentSessions.reduce(
    (acc, session) => {
      acc[session.agent_id] = (acc[session.agent_id] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    agents,
    recentSessions,
    metrics: metrics || {
      totalSessions: 0,
      completedSessions: 0,
      conversionRate: 0,
      trendingSources: [],
    },
    usage: usage || {
      sessions: 0,
      sessionsLimit: 100,
      agents: 0,
      agentsLimit: 5,
    },
    currentPlan,
    agentSessionsCount,
    isLoading: agentsLoading || sessionsLoading || metricsLoading || usageLoading,
  };
}
