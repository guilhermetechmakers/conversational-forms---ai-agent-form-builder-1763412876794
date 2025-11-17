import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Agent, CreateAgentInput, UpdateAgentInput } from "@/types/agent";
import { toast } from "sonner";

export function useAgent(agentId?: string) {
  return useQuery({
    queryKey: ["agent", agentId],
    queryFn: () => api.get<Agent>(`/agents/${agentId}`),
    enabled: !!agentId,
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAgentInput) => api.post<Agent>("/agents", data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.setQueryData(["agent", data.id], data);
      toast.success("Agent created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create agent");
    },
  });
}

export function useUpdateAgent(agentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAgentInput) =>
      api.patch<Agent>(`/agents/${agentId}`, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.setQueryData(["agent", agentId], data);
      toast.success("Agent updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update agent");
    },
  });
}

export function usePublishAgent(agentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post<Agent>(`/agents/${agentId}/publish`, {}),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.setQueryData(["agent", agentId], data);
      toast.success("Agent published successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to publish agent");
    },
  });
}

export function useUnpublishAgent(agentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post<Agent>(`/agents/${agentId}/unpublish`, {}),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.setQueryData(["agent", agentId], data);
      toast.success("Agent unpublished successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to unpublish agent");
    },
  });
}

export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: () => api.get<Agent[]>("/agents"),
  });
}
