export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';

export interface SessionMessage {
  id: string;
  role: 'assistant' | 'user' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ParsedField {
  field_id: string;
  field_name: string;
  value: string | string[] | boolean | number;
  validated: boolean;
  validation_error?: string;
}

export interface Session {
  id: string;
  agent_id: string;
  workspace_id: string;
  status: SessionStatus;
  transcript: SessionMessage[];
  parsed_fields: ParsedField[];
  metadata: {
    referrer?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    ip?: string;
    user_agent?: string;
  };
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface CreateSessionInput {
  agent_id: string;
  metadata?: Session['metadata'];
}

export interface SessionExport {
  session_id: string;
  agent_name: string;
  status: SessionStatus;
  fields: ParsedField[];
  transcript: SessionMessage[];
  metadata: Session['metadata'];
  created_at: string;
  completed_at?: string;
}

export interface SessionNote {
  id: string;
  session_id: string;
  content: string;
  author_id: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

export interface SessionTag {
  id: string;
  name: string;
  color?: string;
}

export interface SessionActivity {
  id: string;
  session_id: string;
  action_type: 'webhook_sent' | 'webhook_failed' | 'export_csv' | 'export_json' | 'crm_contact_created' | 'note_added' | 'tag_added' | 'session_deleted';
  status: 'success' | 'failed' | 'pending';
  details?: Record<string, unknown>;
  created_at: string;
}

import type { WebhookDelivery } from "./webhook";

export interface SessionWithDetails extends Session {
  agent?: {
    id: string;
    name: string;
    slug: string;
  };
  notes?: SessionNote[];
  tags?: SessionTag[];
  activities?: SessionActivity[];
  webhook_deliveries?: WebhookDelivery[];
  assignee_id?: string;
  assignee_name?: string;
  lead_score?: number;
}

// Search and Filter Types
export interface SessionSearchParams {
  query?: string;
  agent_id?: string;
  status?: SessionStatus | SessionStatus[];
  date_from?: string;
  date_to?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  page?: number;
  limit?: number;
  sort_by?: 'created_at' | 'updated_at' | 'completed_at';
  sort_order?: 'asc' | 'desc';
}

export interface SessionSearchResponse {
  sessions: SessionWithDetails[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Export Types
export interface ExportConfig {
  format: 'csv' | 'json';
  session_ids: string[];
  include_transcript?: boolean;
  include_metadata?: boolean;
  scheduled?: boolean;
  scheduled_time?: string;
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
}

export interface ExportLog {
  id: string;
  export_id: string;
  session_id?: string;
  format: 'csv' | 'json';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  scheduled_time?: string;
  completed_at?: string;
  file_url?: string;
  error_message?: string;
  created_at: string;
}

export interface ScheduledExport {
  id: string;
  name: string;
  format: 'csv' | 'json';
  filters: SessionSearchParams;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  next_run_at: string;
  last_run_at?: string;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
  updated_at: string;
}
