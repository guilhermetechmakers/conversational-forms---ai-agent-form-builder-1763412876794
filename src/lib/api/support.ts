import { api } from "@/lib/api";
import type { 
  Documentation, 
  Tutorial, 
  DocSearchResult, 
  CreateSupportTicketInput,
  SupportTicket,
  FeedbackInput,
  APIDoc,
  DocCategory
} from "@/types/help";

export interface ContactSupportRequest {
  email: string;
  subject: string;
  message: string;
  error_type?: string;
  page_url?: string;
  user_agent?: string;
}

export interface ContactSupportResponse {
  success: boolean;
  message: string;
  ticket_id?: string;
}

export const supportApi = {
  /**
   * Submit a contact support form
   */
  contact: async (data: ContactSupportRequest): Promise<ContactSupportResponse> => {
    return api.post<ContactSupportResponse>("/support/contact", data);
  },

  /**
   * Search documentation and tutorials
   */
  searchDocs: async (query: string, category?: DocCategory): Promise<DocSearchResult> => {
    const params = new URLSearchParams({ q: query });
    if (category) params.append('category', category);
    return api.get<DocSearchResult>(`/help/docs/search?${params.toString()}`);
  },

  /**
   * Get documentation by ID
   */
  getDoc: async (id: string): Promise<Documentation> => {
    return api.get<Documentation>(`/help/docs/${id}`);
  },

  /**
   * Get all documentation by category
   */
  getDocsByCategory: async (category: DocCategory): Promise<Documentation[]> => {
    return api.get<Documentation[]>(`/help/docs?category=${category}`);
  },

  /**
   * Get popular documentation
   */
  getPopularDocs: async (limit = 10): Promise<Documentation[]> => {
    return api.get<Documentation[]>(`/help/docs/popular?limit=${limit}`);
  },

  /**
   * Get tutorial by ID
   */
  getTutorial: async (id: string): Promise<Tutorial> => {
    return api.get<Tutorial>(`/help/tutorials/${id}`);
  },

  /**
   * Get all tutorials
   */
  getTutorials: async (category?: DocCategory): Promise<Tutorial[]> => {
    const url = category 
      ? `/help/tutorials?category=${category}`
      : '/help/tutorials';
    return api.get<Tutorial[]>(url);
  },

  /**
   * Submit support ticket
   */
  createTicket: async (data: CreateSupportTicketInput): Promise<SupportTicket> => {
    return api.post<SupportTicket>("/support/tickets", data);
  },

  /**
   * Submit feedback for documentation or tutorial
   */
  submitFeedback: async (data: FeedbackInput): Promise<{ success: boolean }> => {
    return api.post<{ success: boolean }>("/help/feedback", data);
  },

  /**
   * Get API documentation
   */
  getAPIDocs: async (): Promise<APIDoc[]> => {
    return api.get<APIDoc[]>("/help/api-docs");
  },
};
