import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/lib/api/notification";
import type {
  UpdateNotificationInput,
  UpdateNotificationPreferencesInput,
} from "@/types/notification";
import { toast } from "sonner";

// Get all notifications
export function useNotifications(params?: {
  status?: string;
  type?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => notificationApi.getNotifications(params),
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
}

// Get unread notification count
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationApi.getUnreadCount(),
    refetchInterval: 10000, // Refetch every 10 seconds for badge updates
  });
}

// Get single notification
export function useNotification(notificationId: string) {
  return useQuery({
    queryKey: ["notifications", notificationId],
    queryFn: () => notificationApi.getNotification(notificationId),
    enabled: !!notificationId,
  });
}

// Mark notification as read
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationApi.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to mark notification as read");
    },
  });
}

// Mark notification as archived
export function useMarkNotificationAsArchived() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationApi.markAsArchived(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
      toast.success("Notification archived");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to archive notification");
    },
  });
}

// Mark all notifications as read
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
      toast.success("All notifications marked as read");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to mark all notifications as read");
    },
  });
}

// Update notification
export function useUpdateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      notificationId,
      data,
    }: {
      notificationId: string;
      data: UpdateNotificationInput;
    }) => notificationApi.updateNotification(notificationId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.setQueryData(["notifications", variables.notificationId], data);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update notification");
    },
  });
}

// Delete notification
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationApi.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
      toast.success("Notification deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete notification");
    },
  });
}

// Get notification preferences
export function useNotificationPreferences() {
  return useQuery({
    queryKey: ["notifications", "preferences"],
    queryFn: () => notificationApi.getPreferences(),
  });
}

// Update notification preferences
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateNotificationPreferencesInput) =>
      notificationApi.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "preferences"] });
      toast.success("Notification preferences updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update notification preferences");
    },
  });
}

// Get critical alerts (admin only)
export function useCriticalAlerts(params?: {
  status?: string;
  severity?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["admin", "alerts", params],
    queryFn: () => notificationApi.getCriticalAlerts(params),
    refetchInterval: 15000, // Refetch every 15 seconds for admin alerts
  });
}

// Acknowledge critical alert (admin only)
export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: string) => notificationApi.acknowledgeAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "alerts"] });
      toast.success("Alert acknowledged");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to acknowledge alert");
    },
  });
}

// Resolve critical alert (admin only)
export function useResolveAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: string) => notificationApi.resolveAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "alerts"] });
      toast.success("Alert resolved");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to resolve alert");
    },
  });
}
