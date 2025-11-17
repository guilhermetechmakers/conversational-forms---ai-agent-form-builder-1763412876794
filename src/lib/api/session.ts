import { api } from "../api";
import type { Session, CreateSessionInput, SessionMessage, ParsedField, SessionWithDetails, SessionNote, SessionActivity, SessionSearchParams, SessionSearchResponse, ExportConfig, ExportLog, ScheduledExport } from "@/types/session";
import type { WebhookDelivery } from "@/types/webhook";

export interface SendMessageInput {
  session_id: string;
  content: string;
  file_attachments?: File[];
}

export interface SendMessageResponse {
  message: SessionMessage;
  assistant_response?: SessionMessage;
  parsed_fields: ParsedField[];
  progress: {
    current: number;
    total: number;
  };
  is_complete: boolean;
}

export interface CompleteSessionInput {
  session_id: string;
}

export const sessionApi = {
  create: async (input: CreateSessionInput): Promise<Session> => {
    return api.post<Session>("/sessions", input);
  },
  getById: async (id: string): Promise<SessionWithDetails> => {
    return api.get<SessionWithDetails>(`/sessions/${id}`);
  },
  sendMessage: async (input: SendMessageInput): Promise<SendMessageResponse> => {
    const formData = new FormData();
    formData.append("content", input.content);
    if (input.file_attachments) {
      input.file_attachments.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });
    }

    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/sessions/${input.session_id}/messages`;
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `API Error: ${response.status}` }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
  },
  complete: async (input: CompleteSessionInput): Promise<Session> => {
    return api.post<Session>(`/sessions/${input.session_id}/complete`, {});
  },
  restart: async (session_id: string): Promise<Session> => {
    return api.post<Session>(`/sessions/${session_id}/restart`, {});
  },
  export: async (session_id: string, format: 'csv' | 'json'): Promise<Blob> => {
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/sessions/${session_id}/export?format=${format}`;
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `API Error: ${response.status}` }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.blob();
  },
  resendWebhook: async (session_id: string): Promise<WebhookDelivery> => {
    return api.post<WebhookDelivery>(`/sessions/${session_id}/webhooks/resend`, {});
  },
  createCRMContact: async (session_id: string, crm_data: Record<string, unknown>): Promise<{ success: boolean; contact_id?: string }> => {
    return api.post<{ success: boolean; contact_id?: string }>(`/sessions/${session_id}/crm/contact`, crm_data);
  },
  delete: async (session_id: string): Promise<void> => {
    await api.delete(`/sessions/${session_id}`);
  },
  addNote: async (session_id: string, content: string): Promise<SessionNote> => {
    return api.post<SessionNote>(`/sessions/${session_id}/notes`, { content });
  },
  updateNote: async (session_id: string, note_id: string, content: string): Promise<SessionNote> => {
    return api.patch<SessionNote>(`/sessions/${session_id}/notes/${note_id}`, { content });
  },
  deleteNote: async (session_id: string, note_id: string): Promise<void> => {
    await api.delete(`/sessions/${session_id}/notes/${note_id}`);
  },
  addTag: async (session_id: string, tag_id: string): Promise<void> => {
    await api.post(`/sessions/${session_id}/tags`, { tag_id });
  },
  removeTag: async (session_id: string, tag_id: string): Promise<void> => {
    await api.delete(`/sessions/${session_id}/tags/${tag_id}`);
  },
  updateAssignee: async (session_id: string, assignee_id: string | null): Promise<void> => {
    await api.patch(`/sessions/${session_id}/assignee`, { assignee_id });
  },
  updateLeadScore: async (session_id: string, lead_score: number): Promise<void> => {
    await api.patch(`/sessions/${session_id}/lead-score`, { lead_score });
  },
  getActivities: async (session_id: string): Promise<SessionActivity[]> => {
    return api.get<SessionActivity[]>(`/sessions/${session_id}/activities`);
  },
  // Search and Filter
  search: async (params: SessionSearchParams): Promise<SessionSearchResponse> => {
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append('query', params.query);
    if (params.agent_id) queryParams.append('agent_id', params.agent_id);
    if (params.status) {
      const statuses = Array.isArray(params.status) ? params.status : [params.status];
      statuses.forEach(s => queryParams.append('status', s));
    }
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.utm_source) queryParams.append('utm_source', params.utm_source);
    if (params.utm_medium) queryParams.append('utm_medium', params.utm_medium);
    if (params.utm_campaign) queryParams.append('utm_campaign', params.utm_campaign);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_order) queryParams.append('sort_order', params.sort_order);
    
    return api.get<SessionSearchResponse>(`/sessions/search?${queryParams.toString()}`);
  },
  // Bulk Export
  exportBulk: async (config: ExportConfig): Promise<{ export_id: string; file_url?: string }> => {
    return api.post<{ export_id: string; file_url?: string }>("/sessions/export", config);
  },
  // Scheduled Exports
  createScheduledExport: async (exportConfig: Omit<ScheduledExport, 'id' | 'created_at' | 'updated_at'>): Promise<ScheduledExport> => {
    return api.post<ScheduledExport>("/sessions/exports/scheduled", exportConfig);
  },
  getScheduledExports: async (): Promise<ScheduledExport[]> => {
    return api.get<ScheduledExport[]>("/sessions/exports/scheduled");
  },
  updateScheduledExport: async (id: string, updates: Partial<ScheduledExport>): Promise<ScheduledExport> => {
    return api.patch<ScheduledExport>(`/sessions/exports/scheduled/${id}`, updates);
  },
  deleteScheduledExport: async (id: string): Promise<void> => {
    await api.delete(`/sessions/exports/scheduled/${id}`);
  },
  // Export Logs
  getExportLogs: async (export_id?: string): Promise<ExportLog[]> => {
    const url = export_id 
      ? `/sessions/exports/logs?export_id=${export_id}`
      : "/sessions/exports/logs";
    return api.get<ExportLog[]>(url);
  },
  downloadExport: async (export_id: string): Promise<Blob> => {
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/sessions/exports/${export_id}/download`;
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `API Error: ${response.status}` }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.blob();
  },
};
