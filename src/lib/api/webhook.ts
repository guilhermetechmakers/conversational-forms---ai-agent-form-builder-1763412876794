import { api } from "../api";
import type { Webhook, WebhookDelivery, CreateWebhookInput } from "@/types/webhook";

export interface UpdateWebhookInput {
  endpoint?: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  template?: string;
  field_mapping?: Record<string, string>;
  retry_policy?: {
    max_retries: number;
    backoff_multiplier: number;
  };
  status?: 'active' | 'inactive';
}

export interface FieldMapping {
  source_field: string;
  target_field: string;
  transform?: 'none' | 'uppercase' | 'lowercase' | 'trim';
}

export interface TestWebhookInput {
  webhook_id: string;
  sample_data?: Record<string, unknown>;
}

export interface TestWebhookResponse {
  success: boolean;
  status_code?: number;
  response_body?: string;
  error_message?: string;
}

export interface DeliveryLogFilters {
  webhook_id?: string;
  status?: 'pending' | 'success' | 'failed';
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface DeliveryLogsResponse {
  logs: WebhookDelivery[];
  total: number;
  limit: number;
  offset: number;
}

export const webhookApi = {
  // Get all webhooks
  getAll: async (): Promise<Webhook[]> => {
    return api.get<Webhook[]>("/webhooks");
  },

  // Get webhook by ID
  getById: async (id: string): Promise<Webhook> => {
    return api.get<Webhook>(`/webhooks/${id}`);
  },

  // Create webhook
  create: async (input: CreateWebhookInput): Promise<Webhook> => {
    return api.post<Webhook>("/webhooks", input);
  },

  // Update webhook
  update: async (id: string, input: UpdateWebhookInput): Promise<Webhook> => {
    return api.patch<Webhook>(`/webhooks/${id}`, input);
  },

  // Delete webhook
  delete: async (id: string): Promise<void> => {
    await api.delete(`/webhooks/${id}`);
  },

  // Test webhook
  test: async (input: TestWebhookInput): Promise<TestWebhookResponse> => {
    return api.post<TestWebhookResponse>("/webhooks/test", input);
  },

  // Get delivery logs
  getDeliveryLogs: async (filters?: DeliveryLogFilters): Promise<DeliveryLogsResponse> => {
    const params = new URLSearchParams();
    if (filters?.webhook_id) params.append("webhook_id", filters.webhook_id);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.start_date) params.append("start_date", filters.start_date);
    if (filters?.end_date) params.append("end_date", filters.end_date);
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.offset) params.append("offset", filters.offset.toString());

    const query = params.toString();
    return api.get<DeliveryLogsResponse>(`/webhooks/delivery-logs${query ? `?${query}` : ""}`);
  },

  // Retry failed delivery
  retryDelivery: async (delivery_id: string): Promise<WebhookDelivery> => {
    return api.post<WebhookDelivery>(`/webhooks/deliveries/${delivery_id}/retry`, {});
  },

  // Get webhook secret (for display purposes, may be masked)
  getSecret: async (id: string): Promise<{ secret: string }> => {
    return api.get<{ secret: string }>(`/webhooks/${id}/secret`);
  },

  // Regenerate webhook secret
  regenerateSecret: async (id: string): Promise<{ secret: string }> => {
    return api.post<{ secret: string }>(`/webhooks/${id}/regenerate-secret`, {});
  },
};
