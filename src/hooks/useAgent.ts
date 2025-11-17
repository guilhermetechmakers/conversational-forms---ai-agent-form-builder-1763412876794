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

export function useCloneAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agentId: string) => api.post<Agent>(`/agents/${agentId}/clone`, {}),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.setQueryData(["agent", data.id], data);
      toast.success("Agent cloned successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to clone agent");
    },
  });
}

export interface AgentVersion {
  id: string;
  agent_id: string;
  version: number;
  change_log: string;
  created_at: string;
  created_by: string;
}

export function useAgentVersions(agentId: string) {
  return useQuery({
    queryKey: ["agent-versions", agentId],
    queryFn: () => api.get<AgentVersion[]>(`/agents/${agentId}/versions`),
    enabled: !!agentId,
  });
}

export function useRestoreAgentVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agentId, versionId }: { agentId: string; versionId: string }) =>
      api.post<Agent>(`/agents/${agentId}/versions/${versionId}/restore`, {}),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["agent", variables.agentId] });
      queryClient.invalidateQueries({ queryKey: ["agent-versions", variables.agentId] });
      toast.success("Version restored successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to restore version");
    },
  });
}
