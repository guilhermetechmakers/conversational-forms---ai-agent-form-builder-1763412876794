import { api } from "../api";
import type {
  AnalyticsMetrics,
  AgentPerformanceData,
  SessionTimeSeriesData,
  FunnelAnalysis,
  TrafficSource,
  AnalyticsFilters,
  ExportReportRequest,
  ScheduledReport,
} from "@/types/analytics";

export const analyticsApi = {
  getMetrics: async (filters?: AnalyticsFilters): Promise<AnalyticsMetrics> => {
    const params = new URLSearchParams();
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.agent_ids?.length) {
      filters.agent_ids.forEach(id => params.append('agent_ids', id));
    }
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    
    const queryString = params.toString();
    return api.get<AnalyticsMetrics>(`/analytics/metrics${queryString ? `?${queryString}` : ''}`);
  },

  getAgentPerformance: async (filters?: AnalyticsFilters): Promise<AgentPerformanceData[]> => {
    const params = new URLSearchParams();
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.agent_ids?.length) {
      filters.agent_ids.forEach(id => params.append('agent_ids', id));
    }
    
    const queryString = params.toString();
    return api.get<AgentPerformanceData[]>(`/analytics/agent-performance${queryString ? `?${queryString}` : ''}`);
  },

  getSessionTimeSeries: async (filters?: AnalyticsFilters): Promise<SessionTimeSeriesData[]> => {
    const params = new URLSearchParams();
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.agent_ids?.length) {
      filters.agent_ids.forEach(id => params.append('agent_ids', id));
    }
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    
    const queryString = params.toString();
    return api.get<SessionTimeSeriesData[]>(`/analytics/sessions/time-series${queryString ? `?${queryString}` : ''}`);
  },

  getFunnelAnalysis: async (filters?: AnalyticsFilters): Promise<FunnelAnalysis> => {
    const params = new URLSearchParams();
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.agent_ids?.length) {
      filters.agent_ids.forEach(id => params.append('agent_ids', id));
    }
    
    const queryString = params.toString();
    return api.get<FunnelAnalysis>(`/analytics/funnel${queryString ? `?${queryString}` : ''}`);
  },

  getTrafficSources: async (filters?: AnalyticsFilters): Promise<TrafficSource[]> => {
    const params = new URLSearchParams();
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.agent_ids?.length) {
      filters.agent_ids.forEach(id => params.append('agent_ids', id));
    }
    
    const queryString = params.toString();
    return api.get<TrafficSource[]>(`/analytics/traffic-sources${queryString ? `?${queryString}` : ''}`);
  },

  exportReport: async (request: ExportReportRequest): Promise<{ download_url: string; report_id: string }> => {
    return api.post<{ download_url: string; report_id: string }>('/analytics/export', request);
  },

  getScheduledReports: async (): Promise<ScheduledReport[]> => {
    return api.get<ScheduledReport[]>('/analytics/scheduled-reports');
  },

  createScheduledReport: async (request: ExportReportRequest & { name: string }): Promise<ScheduledReport> => {
    return api.post<ScheduledReport>('/analytics/scheduled-reports', request);
  },

  updateScheduledReport: async (id: string, updates: Partial<ScheduledReport>): Promise<ScheduledReport> => {
    return api.patch<ScheduledReport>(`/analytics/scheduled-reports/${id}`, updates);
  },

  deleteScheduledReport: async (id: string): Promise<void> => {
    await api.delete(`/analytics/scheduled-reports/${id}`);
  },
};
