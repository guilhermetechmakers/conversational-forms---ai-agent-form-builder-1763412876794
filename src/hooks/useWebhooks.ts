import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { webhookApi } from "@/lib/api/webhook";
import type { CreateWebhookInput } from "@/types/webhook";
import type { UpdateWebhookInput, DeliveryLogFilters, TestWebhookInput } from "@/lib/api/webhook";
import { toast } from "sonner";

// Query keys
export const webhookKeys = {
  all: ["webhooks"] as const,
  lists: () => [...webhookKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...webhookKeys.lists(), filters] as const,
  details: () => [...webhookKeys.all, "detail"] as const,
  detail: (id: string) => [...webhookKeys.details(), id] as const,
  deliveryLogs: (filters?: DeliveryLogFilters) => [...webhookKeys.all, "delivery-logs", filters] as const,
};

// Get all webhooks
export function useWebhooks() {
  return useQuery({
    queryKey: webhookKeys.lists(),
    queryFn: () => webhookApi.getAll(),
  });
}

// Get webhook by ID
export function useWebhook(id: string) {
  return useQuery({
    queryKey: webhookKeys.detail(id),
    queryFn: () => webhookApi.getById(id),
    enabled: !!id,
  });
}

// Get delivery logs
export function useDeliveryLogs(filters?: DeliveryLogFilters) {
  return useQuery({
    queryKey: webhookKeys.deliveryLogs(filters),
    queryFn: () => webhookApi.getDeliveryLogs(filters),
  });
}

// Create webhook mutation
export function useCreateWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWebhookInput) => webhookApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.lists() });
      toast.success("Webhook created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create webhook");
    },
  });
}

// Update webhook mutation
export function useUpdateWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateWebhookInput }) =>
      webhookApi.update(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.lists() });
      queryClient.invalidateQueries({ queryKey: webhookKeys.detail(variables.id) });
      toast.success("Webhook updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update webhook");
    },
  });
}

// Delete webhook mutation
export function useDeleteWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => webhookApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.lists() });
      toast.success("Webhook deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete webhook");
    },
  });
}

// Test webhook mutation
export function useTestWebhook() {
  return useMutation({
    mutationFn: (input: TestWebhookInput) => webhookApi.test(input),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Webhook test successful");
      } else {
        toast.error(response.error_message || "Webhook test failed");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to test webhook");
    },
  });
}

// Retry delivery mutation
export function useRetryDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (delivery_id: string) => webhookApi.retryDelivery(delivery_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.all });
      toast.success("Delivery retry initiated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to retry delivery");
    },
  });
}

// Regenerate secret mutation
export function useRegenerateSecret() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => webhookApi.regenerateSecret(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.detail(id) });
      toast.success("Webhook secret regenerated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to regenerate secret");
    },
  });
}
