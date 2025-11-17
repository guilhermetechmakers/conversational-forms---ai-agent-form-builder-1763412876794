import { api } from '../api';
import type {
  Notification,
  NotificationPreferences,
  CriticalAlert,
  UpdateNotificationInput,
  UpdateNotificationPreferencesInput,
} from '@/types/notification';

export const notificationApi = {
  // Get all notifications for current user
  getNotifications: (params?: { status?: string; type?: string; limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const query = queryParams.toString();
    return api.get<Notification[]>(`/notifications${query ? `?${query}` : ''}`);
  },

  // Get unread notification count
  getUnreadCount: () => {
    return api.get<{ count: number }>('/notifications/unread/count');
  },

  // Get single notification
  getNotification: (notificationId: string) => {
    return api.get<Notification>(`/notifications/${notificationId}`);
  },

  // Mark notification as read
  markAsRead: (notificationId: string) => {
    return api.patch<Notification>(`/notifications/${notificationId}/read`, {});
  },

  // Mark notification as archived
  markAsArchived: (notificationId: string) => {
    return api.patch<Notification>(`/notifications/${notificationId}/archive`, {});
  },

  // Mark all notifications as read
  markAllAsRead: () => {
    return api.post<{ count: number }>('/notifications/read-all', {});
  },

  // Update notification
  updateNotification: (notificationId: string, data: UpdateNotificationInput) => {
    return api.patch<Notification>(`/notifications/${notificationId}`, data);
  },

  // Delete notification
  deleteNotification: (notificationId: string) => {
    return api.delete(`/notifications/${notificationId}`);
  },

  // Get notification preferences
  getPreferences: () => {
    return api.get<NotificationPreferences>('/notifications/preferences');
  },

  // Update notification preferences
  updatePreferences: (data: UpdateNotificationPreferencesInput) => {
    return api.patch<NotificationPreferences>('/notifications/preferences', data);
  },

  // Get critical alerts (admin only)
  getCriticalAlerts: (params?: { status?: string; severity?: string; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.severity) queryParams.append('severity', params.severity);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const query = queryParams.toString();
    return api.get<CriticalAlert[]>(`/admin/alerts${query ? `?${query}` : ''}`);
  },

  // Acknowledge critical alert (admin only)
  acknowledgeAlert: (alertId: string) => {
    return api.patch<CriticalAlert>(`/admin/alerts/${alertId}/acknowledge`, {});
  },

  // Resolve critical alert (admin only)
  resolveAlert: (alertId: string) => {
    return api.patch<CriticalAlert>(`/admin/alerts/${alertId}/resolve`, {});
  },
};
