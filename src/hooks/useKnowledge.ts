import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { knowledgeApi } from "@/lib/api/knowledge";
import type { CreateAttachmentInput } from "@/types/knowledge";
import type { ListAttachmentsParams } from "@/lib/api/knowledge";
import { toast } from "sonner";

export function useAttachments(params?: ListAttachmentsParams) {
  return useQuery({
    queryKey: ["attachments", params],
    queryFn: () => knowledgeApi.list(params),
  });
}

export function useAttachment(id?: string) {
  return useQuery({
    queryKey: ["attachment", id],
    queryFn: () => knowledgeApi.getById(id!),
    enabled: !!id,
  });
}

export function useUploadAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAttachmentInput) => knowledgeApi.upload(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["attachments"] });
      queryClient.setQueryData(["attachment", data.id], data);
      toast.success("Document uploaded successfully. Processing will begin shortly.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload document");
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => knowledgeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments"] });
      toast.success("Document deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete document");
    },
  });
}

export function useReindexAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => knowledgeApi.reindex(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["attachments"] });
      queryClient.setQueryData(["attachment", id], data);
      toast.success("Re-indexing started. This may take a few minutes.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to start re-indexing");
    },
  });
}

export function useAttachmentVersions(id?: string) {
  return useQuery({
    queryKey: ["attachment", id, "versions"],
    queryFn: () => knowledgeApi.getVersions(id!),
    enabled: !!id,
  });
}

export function useRestoreVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) =>
      knowledgeApi.restoreVersion(id, version),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["attachments"] });
      queryClient.invalidateQueries({ queryKey: ["attachment", data.id] });
      queryClient.invalidateQueries({ queryKey: ["attachment", data.id, "versions"] });
      toast.success("Version restored successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to restore version");
    },
  });
}
