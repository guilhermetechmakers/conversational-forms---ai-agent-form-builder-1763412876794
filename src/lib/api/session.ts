import { api } from "../api";
import type { Session, CreateSessionInput, SessionMessage, ParsedField } from "@/types/session";

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
  getById: async (id: string): Promise<Session> => {
    return api.get<Session>(`/sessions/${id}`);
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
};
