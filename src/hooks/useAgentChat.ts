import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { agentApi } from "@/lib/api/agent";
import { sessionApi, type SendMessageInput, type SendMessageResponse } from "@/lib/api/session";
import type { Session } from "@/types/session";
import { toast } from "sonner";

export function useAgent() {
  const { workspace, slug } = useParams<{ workspace: string; slug: string }>();

  return useQuery({
    queryKey: ["agent", workspace, slug],
    queryFn: () => agentApi.getBySlug({ workspace: workspace!, slug: slug! }),
    enabled: !!workspace && !!slug,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSession(sessionId: string | null) {
  return useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => sessionApi.getById(sessionId!),
    enabled: !!sessionId,
    refetchInterval: (query) => {
      const session = query.state.data as Session | undefined;
      // Poll every 2 seconds if session is in progress
      return session?.status === "in_progress" ? 2000 : false;
    },
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sessionApi.create,
    onSuccess: (session) => {
      queryClient.setQueryData(["session", session.id], session);
      toast.success("Session started");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create session");
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SendMessageInput) => sessionApi.sendMessage(input),
    onSuccess: (data: SendMessageResponse, variables) => {
      // Update session with new messages and fields
      queryClient.setQueryData<Session>(["session", variables.session_id], (old) => {
        if (!old) return old;
        return {
          ...old,
          transcript: [
            ...old.transcript,
            data.message,
            ...(data.assistant_response ? [data.assistant_response] : []),
          ],
          parsed_fields: data.parsed_fields,
          status: data.is_complete ? "completed" : "in_progress",
          updated_at: new Date().toISOString(),
        };
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send message");
    },
  });
}

export function useCompleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => sessionApi.complete({ session_id: sessionId }),
    onSuccess: (session) => {
      queryClient.setQueryData(["session", session.id], session);
      toast.success("Session completed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to complete session");
    },
  });
}

export function useRestartSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sessionApi.restart,
    onSuccess: (session) => {
      queryClient.setQueryData(["session", session.id], session);
      toast.success("Session restarted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to restart session");
    },
  });
}
