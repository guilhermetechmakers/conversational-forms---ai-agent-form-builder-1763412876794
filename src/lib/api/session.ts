import { api } from "../api";
import type { Session, CreateSessionInput, SessionMessage, ParsedField, SessionWithDetails, SessionNote, SessionActivity } from "@/types/session";
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
};
