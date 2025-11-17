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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionApi } from "@/lib/api/session";
import { toast } from "sonner";
import type { ExportConfig } from "@/types/session";

const exportConfigSchema = z.object({
  format: z.enum(["csv", "json"]),
  include_transcript: z.boolean().default(false),
  include_metadata: z.boolean().default(true),
  scheduled: z.boolean().default(false),
  scheduled_time: z.string().optional(),
  frequency: z.enum(["once", "daily", "weekly", "monthly"]).optional(),
});

type ExportConfigForm = z.infer<typeof exportConfigSchema>;

interface ExportConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionIds: string[];
  onSuccess?: () => void;
}

export function ExportConfigDialog({
  open,
  onOpenChange,
  sessionIds,
  onSuccess,
}: ExportConfigDialogProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExportConfigForm>({
    resolver: zodResolver(exportConfigSchema),
    defaultValues: {
      format: "csv",
      include_transcript: false,
      include_metadata: true,
      scheduled: false,
    },
  });

  const isScheduled = watch("scheduled");
  const format = watch("format");

  const exportMutation = useMutation({
    mutationFn: async (data: ExportConfigForm) => {
      const config: ExportConfig = {
        format: data.format,
        session_ids: sessionIds,
        include_transcript: data.include_transcript,
        include_metadata: data.include_metadata,
        scheduled: data.scheduled,
        scheduled_time: data.scheduled_time,
        frequency: data.frequency,
      };
      return sessionApi.exportBulk(config);
    },
    onSuccess: (data) => {
      toast.success(
        isScheduled
          ? "Scheduled export created successfully"
          : data.file_url
          ? "Export completed successfully"
          : "Export started successfully"
      );
      queryClient.invalidateQueries({ queryKey: ["sessions", "export"] });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create export");
    },
  });

  const onSubmit = (data: ExportConfigForm) => {
    exportMutation.mutate(data);
  };

  const handleDownload = async () => {
    if (exportMutation.data?.file_url) {
      window.open(exportMutation.data.file_url, "_blank");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Sessions</DialogTitle>
          <DialogDescription>
            Export {sessionIds.length} session{sessionIds.length !== 1 ? "s" : ""} in your preferred format
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <RadioGroup
              value={format}
              onValueChange={(value) => setValue("format", value as "csv" | "json")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="font-normal cursor-pointer">
                  CSV (Excel compatible)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="font-normal cursor-pointer">
                  JSON (Structured data)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Include Options */}
          <div className="space-y-3">
            <Label>Include</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include_metadata"
                  checked={watch("include_metadata")}
                  onCheckedChange={(checked) =>
                    setValue("include_metadata", checked as boolean)
                  }
                />
                <Label
                  htmlFor="include_metadata"
                  className="font-normal cursor-pointer"
                >
                  Metadata (UTM parameters, referrer, etc.)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include_transcript"
                  checked={watch("include_transcript")}
                  onCheckedChange={(checked) =>
                    setValue("include_transcript", checked as boolean)
                  }
                />
                <Label
                  htmlFor="include_transcript"
                  className="font-normal cursor-pointer"
                >
                  Full conversation transcript
                </Label>
              </div>
            </div>
          </div>

          {/* Scheduled Export */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="scheduled"
                checked={isScheduled}
                onCheckedChange={(checked) =>
                  setValue("scheduled", checked as boolean)
                }
              />
              <Label htmlFor="scheduled" className="font-normal cursor-pointer">
                Schedule recurring export
              </Label>
            </div>
            {isScheduled && (
              <div className="space-y-2 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <RadioGroup
                    value={watch("frequency") || "daily"}
                    onValueChange={(value) =>
                      setValue("frequency", value as ExportConfigForm["frequency"])
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="daily" id="daily" />
                      <Label htmlFor="daily" className="font-normal cursor-pointer">
                        Daily
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="weekly" id="weekly" />
                      <Label htmlFor="weekly" className="font-normal cursor-pointer">
                        Weekly
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly" className="font-normal cursor-pointer">
                        Monthly
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduled_time">Start Date & Time</Label>
                  <Input
                    id="scheduled_time"
                    type="datetime-local"
                    {...register("scheduled_time")}
                  />
                  {errors.scheduled_time && (
                    <p className="text-sm text-destructive">
                      {errors.scheduled_time.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            {exportMutation.data?.file_url && !isScheduled && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDownload}
              >
                Download
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Exporting..."
                : isScheduled
                ? "Schedule Export"
                : "Export Now"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
