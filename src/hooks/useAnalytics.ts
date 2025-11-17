import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api/analytics";
import type { AnalyticsFilters } from "@/types/analytics";

export function useAnalyticsMetrics(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'metrics', filters],
    queryFn: () => analyticsApi.getMetrics(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAgentPerformance(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'agent-performance', filters],
    queryFn: () => analyticsApi.getAgentPerformance(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSessionTimeSeries(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'sessions', 'time-series', filters],
    queryFn: () => analyticsApi.getSessionTimeSeries(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useFunnelAnalysis(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'funnel', filters],
    queryFn: () => analyticsApi.getFunnelAnalysis(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTrafficSources(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'traffic-sources', filters],
    queryFn: () => analyticsApi.getTrafficSources(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useScheduledReports() {
  return useQuery({
    queryKey: ['analytics', 'scheduled-reports'],
    queryFn: () => analyticsApi.getScheduledReports(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
