import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, X } from "lucide-react";
import { useUploadAttachment } from "@/hooks/useKnowledge";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Agent } from "@/types/agent";
import { cn } from "@/lib/utils";

const uploadSchema = z.object({
  file: z.instanceof(File, { message: "Please select a file" }),
  agent_id: z.string().optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

interface UploadAttachmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadAttachmentDialog({
  open,
  onOpenChange,
}: UploadAttachmentDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const uploadMutation = useUploadAttachment();

  const { data: agents = [] } = useQuery({
    queryKey: ["agents"],
    queryFn: () => api.get<Agent[]>("/agents"),
  });

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
  });

  const agentId = watch("agent_id");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "application/pdf",
        "text/plain",
        "text/markdown",
        "text/md",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const validExtensions = [".pdf", ".txt", ".md", ".doc", ".docx"];

      const isValidType =
        validTypes.includes(file.type) ||
        validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

      if (!isValidType) {
        alert("Please select a PDF, TXT, MD, DOC, or DOCX file");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }

      setSelectedFile(file);
      setValue("file", file);
    }
  };

  const onSubmit = async (data: UploadFormData) => {
    if (!data.file) return;

    try {
      await uploadMutation.mutateAsync({
        file: data.file,
        agent_id: data.agent_id || undefined,
      });
      reset();
      setSelectedFile(null);
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a document to provide context for your conversational agents.
            Supported formats: PDF, TXT, MD, DOC, DOCX (max 10MB)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agent">Agent (Optional)</Label>
            <Select
              value={agentId || ""}
              onValueChange={(value) => setValue("agent_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an agent (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No specific agent</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                selectedFile
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              {selectedFile ? (
                <div className="space-y-2">
                  <FileText className="h-8 w-8 mx-auto text-primary" />
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        setSelectedFile(null);
                        setValue("file", undefined as any);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">
                    Click to select a file
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    PDF, TXT, MD, DOC, or DOCX (max 10MB)
                  </p>
                </>
              )}
              <input
                type="file"
                id="file"
                className="hidden"
                accept=".pdf,.txt,.md,.doc,.docx"
                onChange={handleFileSelect}
              />
              {!selectedFile && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("file")?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Select File
                </Button>
              )}
            </div>
            {errors.file && (
              <p className="text-sm text-destructive">{errors.file.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                reset();
                setSelectedFile(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedFile || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
