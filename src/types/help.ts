export type DocCategory = 'articles' | 'faqs' | 'quickstart' | 'api' | 'troubleshooting';

export interface Documentation {
  id: string;
  title: string;
  content: string;
  category: DocCategory;
  tags: string[];
  last_updated: string;
  views?: number;
  helpful_count?: number;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
  category: DocCategory;
  estimated_time?: number; // in minutes
  media_url?: string;
}

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  order: number;
  media_url?: string;
  interactive?: boolean;
}

export interface SupportTicket {
  id: string;
  user_id?: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface CreateSupportTicketInput {
  subject: string;
  description: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface FeedbackInput {
  doc_id?: string;
  tutorial_id?: string;
  rating: 'helpful' | 'not_helpful';
  comment?: string;
}

export interface DocSearchResult {
  docs: Documentation[];
  tutorials: Tutorial[];
  total: number;
  query: string;
}

export interface APIDoc {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  description: string;
  parameters?: APIParameter[];
  examples?: APIExample[];
  category?: string;
}

export interface APIParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default?: string;
}

export interface APIExample {
  language: string;
  code: string;
  description?: string;
}
