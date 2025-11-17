export type NotificationType = 
  | 'session_completed'
  | 'session_abandoned'
  | 'webhook_failed'
  | 'webhook_success'
  | 'billing_invoice'
  | 'billing_payment_failed'
  | 'billing_usage_threshold'
  | 'team_mention'
  | 'team_invite'
  | 'agent_published'
  | 'agent_unpublished'
  | 'knowledge_indexed'
  | 'knowledge_index_failed'
  | 'admin_alert'
  | 'system_update';

export type NotificationStatus = 'unread' | 'read' | 'archived';

export type NotificationChannel = 'email' | 'in_app' | 'both';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  content: string;
  status: NotificationStatus;
  metadata?: {
    session_id?: string;
    agent_id?: string;
    webhook_id?: string;
    invoice_id?: string;
    link?: string;
    [key: string]: unknown;
  };
  created_at: string;
  read_at?: string;
  archived_at?: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_notifications: boolean;
  in_app_notifications: boolean;
  preferred_channels: NotificationChannel;
  notification_types: {
    [key in NotificationType]: {
      email: boolean;
      in_app: boolean;
    };
  };
  updated_at: string;
}

export interface CriticalAlert {
  id: string;
  event_id: string;
  event_type: 'webhook_failure' | 'system_error' | 'billing_issue' | 'security_alert';
  description: string;
  status: 'active' | 'resolved' | 'acknowledged';
  severity: 'low' | 'medium' | 'high' | 'critical';
  retry_count: number;
  metadata?: Record<string, unknown>;
  created_at: string;
  resolved_at?: string;
  acknowledged_by?: string;
  acknowledged_at?: string;
}

export interface CreateNotificationInput {
  user_id: string;
  type: NotificationType;
  title: string;
  content: string;
  metadata?: Notification['metadata'];
}

export interface UpdateNotificationInput {
  status?: NotificationStatus;
}

export interface UpdateNotificationPreferencesInput {
  email_notifications?: boolean;
  in_app_notifications?: boolean;
  preferred_channels?: NotificationChannel;
  notification_types?: Partial<NotificationPreferences['notification_types']>;
}
