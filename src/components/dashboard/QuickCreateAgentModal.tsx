import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { CreateAgentInput } from "@/types/agent";

const createAgentSchema = z.object({
  name: z.string().min(1, "Agent name is required").max(100, "Name too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50, "Slug too long")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
});

type CreateAgentFormData = z.infer<typeof createAgentSchema>;

interface QuickCreateAgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickCreateAgentModal({
  open,
  onOpenChange,
}: QuickCreateAgentModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateAgentFormData>({
    resolver: zodResolver(createAgentSchema),
  });

  const createAgentMutation = useMutation({
    mutationFn: async (data: CreateAgentFormData) => {
      const agentData: CreateAgentInput = {
        name: data.name,
        slug: data.slug,
        fields: [],
        persona: {
          name: data.name,
          tone: "friendly",
          greeting_template: `Hello! I'm ${data.name}. How can I help you today?`,
        },
        appearance: {},
      };
      return api.post<{ id: string }>("/agents", agentData);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success("Agent created successfully");
      reset();
      onOpenChange(false);
      navigate(`/agents/${response.id}/edit`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create agent");
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: CreateAgentFormData) => {
    setIsSubmitting(true);
    createAgentMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Agent</DialogTitle>
          <DialogDescription>
            Create a new conversational form agent. You can configure fields, persona, and
            settings after creation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                placeholder="My Contact Form"
                {...register("name")}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                placeholder="my-contact-form"
                {...register("slug")}
                className={errors.slug ? "border-destructive" : ""}
              />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Used in the public URL: /a/workspace/{`{slug}`}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Agent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
