import { api } from "../api";
import type { KnowledgeAttachment, CreateAttachmentInput } from "@/types/knowledge";

// Helper function for file uploads
async function uploadFile<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}${endpoint}`;
  
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    const error = await response.json().catch(() => ({ message: `API Error: ${response.status}` }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

export interface ListAttachmentsParams {
  agent_id?: string;
  status?: KnowledgeAttachment['status'];
  limit?: number;
  offset?: number;
}

export interface AttachmentVersion {
  version: number;
  created_at: string;
  indexed_at?: string;
  file_size: number;
}

export const knowledgeApi = {
  list: async (params?: ListAttachmentsParams): Promise<KnowledgeAttachment[]> => {
    const queryParams = new URLSearchParams();
    if (params?.agent_id) queryParams.append('agent_id', params.agent_id);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const queryString = queryParams.toString();
    return api.get<KnowledgeAttachment[]>(`/knowledge/attachments${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: string): Promise<KnowledgeAttachment> => {
    return api.get<KnowledgeAttachment>(`/knowledge/attachments/${id}`);
  },

  upload: async (input: CreateAttachmentInput): Promise<KnowledgeAttachment> => {
    const formData = new FormData();
    formData.append('file', input.file);
    if (input.agent_id) {
      formData.append('agent_id', input.agent_id);
    }
    
    return uploadFile<KnowledgeAttachment>('/knowledge/attachments', formData);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/knowledge/attachments/${id}`);
  },

  reindex: async (id: string): Promise<KnowledgeAttachment> => {
    return api.post<KnowledgeAttachment>(`/knowledge/attachments/${id}/reindex`, {});
  },

  getVersions: async (id: string): Promise<AttachmentVersion[]> => {
    return api.get<AttachmentVersion[]>(`/knowledge/attachments/${id}/versions`);
  },

  restoreVersion: async (id: string, version: number): Promise<KnowledgeAttachment> => {
    return api.post<KnowledgeAttachment>(`/knowledge/attachments/${id}/restore`, { version });
  },
};
