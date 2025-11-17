import { useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Webhook, CreateWebhookInput } from "@/types/webhook";
import type { UpdateWebhookInput } from "@/lib/api/webhook";
import { useCreateWebhook, useUpdateWebhook } from "@/hooks/useWebhooks";

const webhookSchema = z.object({
  endpoint: z.string().url("Must be a valid URL"),
  method: z.enum(["POST", "PUT", "PATCH"]).default("POST"),
  headers: z.string().optional(),
  template: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  retry_policy: z.object({
    max_retries: z.number().min(0).max(10).default(3),
    backoff_multiplier: z.number().min(1).max(10).default(2),
  }).optional(),
});

type WebhookFormData = z.infer<typeof webhookSchema>;

interface WebhookFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhook?: Webhook | null;
  onSuccess?: () => void;
}

export function WebhookFormModal({
  open,
  onOpenChange,
  webhook,
  onSuccess,
}: WebhookFormModalProps) {
  const createMutation = useCreateWebhook();
  const updateMutation = useUpdateWebhook();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<WebhookFormData>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      endpoint: "",
      method: "POST",
      status: "active",
      retry_policy: {
        max_retries: 3,
        backoff_multiplier: 2,
      },
    },
  });

  const status = watch("status");

  useEffect(() => {
    if (webhook) {
      reset({
        endpoint: webhook.endpoint,
        method: webhook.method,
        headers: webhook.headers ? JSON.stringify(webhook.headers, null, 2) : "",
        template: webhook.template || "",
        status: webhook.status === "error" ? "inactive" : webhook.status,
        retry_policy: webhook.retry_policy,
      });
    } else {
      reset({
        endpoint: "",
        method: "POST",
        headers: "",
        template: "",
        status: "active",
        retry_policy: {
          max_retries: 3,
          backoff_multiplier: 2,
        },
      });
    }
  }, [webhook, reset]);

  const onSubmit = async (data: WebhookFormData) => {
    try {
      let headers: Record<string, string> | undefined;
      if (data.headers) {
        try {
          headers = JSON.parse(data.headers);
        } catch {
          throw new Error("Invalid JSON in headers field");
        }
      }

      if (webhook) {
        const updatePayload: UpdateWebhookInput = {
          endpoint: data.endpoint,
          method: data.method,
          headers,
          template: data.template || undefined,
          retry_policy: data.retry_policy,
          status: data.status,
        };
        await updateMutation.mutateAsync({
          id: webhook.id,
          input: updatePayload,
        });
      } else {
        const createPayload: CreateWebhookInput = {
          endpoint: data.endpoint,
          method: data.method,
          headers,
          template: data.template || undefined,
          retry_policy: data.retry_policy,
        };
        await createMutation.mutateAsync(createPayload);
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {webhook ? "Edit Webhook" : "Create New Webhook"}
          </DialogTitle>
          <DialogDescription>
            Configure your webhook endpoint and settings
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="endpoint">Endpoint URL *</Label>
            <Input
              id="endpoint"
              placeholder="https://example.com/webhook"
              {...register("endpoint")}
            />
            {errors.endpoint && (
              <p className="text-sm text-destructive">{errors.endpoint.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="method">HTTP Method</Label>
              <Select
                value={watch("method")}
                onValueChange={(value) => setValue("method", value as "POST" | "PUT" | "PATCH")}
              >
                <SelectTrigger id="method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={status === "active"}
                  onCheckedChange={(checked) => setValue("status", checked ? "active" : "inactive")}
                />
                <span className="text-sm text-muted-foreground">
                  {status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="headers">Headers (JSON)</Label>
            <Textarea
              id="headers"
              placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
              rows={4}
              {...register("headers")}
            />
            {errors.headers && (
              <p className="text-sm text-destructive">{errors.headers.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Optional: Custom headers as JSON object
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">Payload Template (JSON)</Label>
            <Textarea
              id="template"
              placeholder='{"session_id": "{{session_id}}", "fields": "{{fields}}"}'
              rows={6}
              {...register("template")}
            />
            <p className="text-xs text-muted-foreground">
              Optional: Custom payload template with placeholders
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_retries">Max Retries</Label>
              <Input
                id="max_retries"
                type="number"
                min={0}
                max={10}
                {...register("retry_policy.max_retries", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="backoff_multiplier">Backoff Multiplier</Label>
              <Input
                id="backoff_multiplier"
                type="number"
                min={1}
                max={10}
                {...register("retry_policy.backoff_multiplier", { valueAsNumber: true })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : webhook ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
