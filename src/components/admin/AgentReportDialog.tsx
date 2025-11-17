import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AbuseReport } from "@/types/admin";

interface AgentReportDialogProps {
  report: AbuseReport;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (data: { report_id: string; status: AbuseReport['status']; notes?: string }) => void;
}

export function AgentReportDialog({
  report,
  open,
  onOpenChange,
  onUpdate,
}: AgentReportDialogProps) {
  const [status, setStatus] = useState<AbuseReport['status']>(report.status);
  const [notes, setNotes] = useState("");

  const handleUpdate = () => {
    onUpdate({
      report_id: report.id,
      status,
      notes: notes || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Abuse Report Details</DialogTitle>
          <DialogDescription>
            Review and manage this abuse report
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Agent ID</Label>
            <div className="font-mono text-sm p-2 bg-muted rounded-md">
              {report.agent_id}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reason</Label>
            <div className="p-2 bg-muted rounded-md">{report.reason}</div>
          </div>

          {report.description && (
            <div className="space-y-2">
              <Label>Description</Label>
              <div className="p-2 bg-muted rounded-md whitespace-pre-wrap">
                {report.description}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Reporter</Label>
            <div className="text-sm">
              {report.reporter_email || 'Anonymous'}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Current Status</Label>
            <Badge variant={status === 'pending' ? 'destructive' : 'default'}>
              {status}
            </Badge>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Update Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as AbuseReport['status'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add internal notes about this report..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Created At</Label>
            <div className="text-sm text-muted-foreground">
              {new Date(report.created_at).toLocaleString()}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleUpdate}>
            Update Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
