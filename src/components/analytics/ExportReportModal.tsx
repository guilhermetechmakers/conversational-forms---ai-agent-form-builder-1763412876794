import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { analyticsApi } from "@/lib/api/analytics";
import type { AnalyticsFilters, ExportReportRequest } from "@/types/analytics";

const exportSchema = z.object({
  format: z.enum(['csv', 'json', 'pdf']),
  name: z.string().min(1, "Report name is required").optional(),
  include_charts: z.boolean().default(false),
  scheduled: z.boolean().default(false),
  schedule_frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  schedule_time: z.string().optional(),
  email_recipients: z.string().optional(),
});

type ExportFormData = z.infer<typeof exportSchema>;

interface ExportReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: AnalyticsFilters;
}

export function ExportReportModal({
  open,
  onOpenChange,
  filters,
}: ExportReportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ExportFormData>({
    resolver: zodResolver(exportSchema),
    defaultValues: {
      format: 'csv',
      include_charts: false,
      scheduled: false,
    },
  });

  const isScheduled = watch('scheduled');
  const format = watch('format');

  const onSubmit = async (data: ExportFormData) => {
    setIsExporting(true);
    try {
      const request: ExportReportRequest = {
        format: data.format,
        filters,
        include_charts: data.include_charts,
        scheduled: data.scheduled,
        schedule_frequency: data.schedule_frequency,
        schedule_time: data.schedule_time,
        email_recipients: data.email_recipients
          ? data.email_recipients.split(',').map((e) => e.trim())
          : undefined,
      };

      if (data.scheduled && data.name) {
        // Create scheduled report
        await analyticsApi.createScheduledReport({
          ...request,
          name: data.name,
        });
        toast.success("Scheduled report created successfully");
      } else {
        // Immediate export
        const result = await analyticsApi.exportReport(request);
        // Trigger download
        window.open(result.download_url, '_blank');
        toast.success("Report exported successfully");
      }
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to export report"
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
          <DialogDescription>
            Export your analytics data in the selected format
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="format">Format</Label>
            <Select
              value={format}
              onValueChange={(value) =>
                setValue('format', value as 'csv' | 'json' | 'pdf')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="include_charts"
              checked={watch('include_charts')}
              onCheckedChange={(checked) =>
                setValue('include_charts', checked === true)
              }
            />
            <Label
              htmlFor="include_charts"
              className="text-sm font-normal cursor-pointer"
            >
              Include charts (PDF only)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="scheduled"
              checked={isScheduled}
              onCheckedChange={(checked) =>
                setValue('scheduled', checked === true)
              }
            />
            <Label
              htmlFor="scheduled"
              className="text-sm font-normal cursor-pointer"
            >
              Schedule recurring export
            </Label>
          </div>

          {isScheduled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Report Name</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Monthly Analytics Report"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule_frequency">Frequency</Label>
                <Select
                  onValueChange={(value) =>
                    setValue(
                      'schedule_frequency',
                      value as 'daily' | 'weekly' | 'monthly'
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule_time">Time</Label>
                <Input
                  id="schedule_time"
                  type="time"
                  {...register('schedule_time')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email_recipients">
                  Email Recipients (comma-separated)
                </Label>
                <Input
                  id="email_recipients"
                  {...register('email_recipients')}
                  placeholder="user@example.com, admin@example.com"
                />
              </div>
            </>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isExporting}>
              {isExporting
                ? 'Exporting...'
                : isScheduled
                ? 'Schedule Report'
                : 'Export Now'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
