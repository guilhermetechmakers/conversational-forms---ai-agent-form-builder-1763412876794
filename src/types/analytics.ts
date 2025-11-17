export interface AnalyticsMetrics {
  total_sessions: number;
  completed_sessions: number;
  completion_rate: number;
  average_completion_time: number; // in seconds
  leads_generated: number;
  trends: {
    sessions_change: number; // percentage change
    completion_rate_change: number;
    avg_time_change: number;
    leads_change: number;
  };
  period_comparison: {
    previous_period_sessions: number;
    previous_period_completion_rate: number;
    previous_period_avg_time: number;
    previous_period_leads: number;
  };
}

export interface AgentPerformanceData {
  agent_id: string;
  agent_name: string;
  sessions_count: number;
  completed_count: number;
  completion_rate: number;
  average_time: number;
  leads_generated: number;
}

export interface SessionTimeSeriesData {
  date: string;
  sessions: number;
  completed: number;
  in_progress: number;
  abandoned: number;
}

export interface FunnelStep {
  step_name: string;
  step_order: number;
  sessions_count: number;
  drop_off_count: number;
  drop_off_rate: number;
  average_time_at_step: number;
}

export interface FunnelAnalysis {
  total_started: number;
  steps: FunnelStep[];
  overall_completion_rate: number;
  average_total_time: number;
}

export interface TrafficSource {
  id: string;
  source: string;
  medium?: string;
  campaign?: string;
  referrer?: string;
  sessions_count: number;
  completed_count: number;
  completion_rate: number;
  percentage_of_total: number;
  average_time: number;
}

export interface AnalyticsFilters {
  date_from?: string;
  date_to?: string;
  agent_ids?: string[];
  status?: 'all' | 'completed' | 'in_progress' | 'abandoned';
}

export interface ExportReportRequest {
  format: 'csv' | 'json' | 'pdf';
  filters: AnalyticsFilters;
  include_charts?: boolean;
  scheduled?: boolean;
  schedule_frequency?: 'daily' | 'weekly' | 'monthly';
  schedule_time?: string;
  email_recipients?: string[];
}

export interface ScheduledReport {
  id: string;
  name: string;
  format: 'csv' | 'json' | 'pdf';
  filters: AnalyticsFilters;
  frequency: 'daily' | 'weekly' | 'monthly';
  schedule_time: string;
  email_recipients: string[];
  last_run?: string;
  next_run: string;
  enabled: boolean;
  created_at: string;
}
