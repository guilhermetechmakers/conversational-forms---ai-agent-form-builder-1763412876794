import { api } from "@/lib/api";

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
};
