import { api } from '../api';

export interface LogUserInteractionInput {
  interactionType: 'PageView' | 'ContactClick' | 'SectionView';
  metadata?: Record<string, unknown>;
}

export interface SubmitLegalRequestInput {
  name: string;
  email: string;
  inquiryType: 'privacy' | 'terms' | 'cookies' | 'data_request' | 'other';
  message: string;
}

export interface LegalRequestResponse {
  message: string;
  requestId?: string;
}

// Legal API endpoints
export const legalApi = {
  /**
   * Log user interaction with Privacy & Terms page
   */
  logInteraction: async (data: LogUserInteractionInput): Promise<void> => {
    return api.post<void>('/legal/interactions', data);
  },

  /**
   * Submit a legal request/inquiry
   */
  submitLegalRequest: async (data: SubmitLegalRequestInput): Promise<LegalRequestResponse> => {
    return api.post<LegalRequestResponse>('/legal/requests', data);
  },
};
