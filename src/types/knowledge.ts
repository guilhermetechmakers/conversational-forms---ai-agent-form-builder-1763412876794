export type AttachmentStatus = 'pending' | 'processing' | 'indexed' | 'error';

export interface KnowledgeAttachment {
  id: string;
  workspace_id: string;
  agent_id?: string;
  filename: string;
  file_type: string;
  file_size: number;
  file_url: string;
  status: AttachmentStatus;
  error_message?: string;
  version: number;
  created_at: string;
  updated_at: string;
  indexed_at?: string;
}

export interface CreateAttachmentInput {
  agent_id?: string;
  file: File;
}
