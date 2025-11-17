export interface Webhook {
  id: string;
  workspace_id: string;
  agent_id?: string;
  endpoint: string;
  secret: string;
  method: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  template?: string;
  field_mapping?: Record<string, string>;
  status: 'active' | 'inactive' | 'error';
  retry_policy: {
    max_retries: number;
    backoff_multiplier: number;
  };
  created_at: string;
  updated_at: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  session_id: string;
  status: 'pending' | 'success' | 'failed';
  response_code?: number;
  response_body?: string;
  error_message?: string;
  attempts: number;
  delivered_at?: string;
  created_at: string;
}

export interface CreateWebhookInput {
  agent_id?: string;
  endpoint: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  template?: string;
  field_mapping?: Record<string, string>;
  retry_policy?: {
    max_retries: number;
    backoff_multiplier: number;
  };
}
