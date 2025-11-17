export interface AdminUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  workspace_id?: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  status: 'active' | 'suspended' | 'pending';
  email_verified: boolean;
  two_factor_enabled: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  session_count?: number;
}

export interface AdminAgent {
  id: string;
  name: string;
  slug: string;
  workspace_id: string;
  owner_id: string;
  status: 'published' | 'draft' | 'archived';
  session_count: number;
  abuse_reports_count: number;
  created_at: string;
  updated_at: string;
  owner?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export interface AbuseReport {
  id: string;
  agent_id: string;
  reporter_email?: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface SystemMetrics {
  total_sessions: number;
  active_sessions: number;
  total_users: number;
  total_agents: number;
  llm_cost_estimate: number;
  webhook_success_rate: number;
  webhook_total_attempts: number;
  webhook_failed_attempts: number;
  sessions_today: number;
  sessions_this_week: number;
  sessions_this_month: number;
  completion_rate: number;
  avg_session_duration: number;
}

export interface AuditLog {
  id: string;
  event_type: 'user_action' | 'billing_change' | 'api_key_rotation' | 'security_event' | 'system_change';
  user_id?: string;
  user_email?: string;
  action: string;
  details: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface AuditLogFilters {
  event_type?: AuditLog['event_type'];
  user_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export interface InviteUserInput {
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  workspace_id?: string;
}

export interface UpdateUserRoleInput {
  user_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
}

export interface SuspendUserInput {
  user_id: string;
  reason?: string;
}

export interface UpdateAbuseReportInput {
  report_id: string;
  status: AbuseReport['status'];
  notes?: string;
}
