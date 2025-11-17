import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Download, 
  Trash2, 
  FileText, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";
import { securityApi } from "@/lib/api/security";
import type { ComplianceRequest, DataExportRequest, DataDeletionRequest } from "@/types/security";
import { toast } from "sonner";
import { format } from "date-fns";

export function ComplianceActions() {
  const queryClient = useQueryClient();
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [deletionModalOpen, setDeletionModalOpen] = useState(false);
  const [confirmDeletionOpen, setConfirmDeletionOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");
  const [includePII, setIncludePII] = useState(false);
  const [deletionReason, setDeletionReason] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["security", "compliance", "requests"],
    queryFn: () => securityApi.getComplianceRequests(),
  });

  const exportMutation = useMutation({
    mutationFn: (request: DataExportRequest) => securityApi.requestDataExport(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "compliance", "requests"] });
      toast.success("Data export request submitted. You'll be notified when it's ready.");
      setExportModalOpen(false);
      setExportFormat("json");
      setIncludePII(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to request data export");
    },
  });

  const deletionMutation = useMutation({
    mutationFn: (request: DataDeletionRequest) => securityApi.requestDataDeletion(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "compliance", "requests"] });
      toast.success("Data deletion request submitted. This action cannot be undone.");
      setDeletionModalOpen(false);
      setConfirmDeletionOpen(false);
      setDeletionReason("");
      setConfirmText("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to request data deletion");
    },
  });

  const downloadExportMutation = useMutation({
    mutationFn: (requestId: string) => securityApi.downloadDataExport(requestId),
    onSuccess: (blob, requestId) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `data-export-${requestId}-${Date.now()}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Data export downloaded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to download data export");
    },
  });

  const cancelDeletionMutation = useMutation({
    mutationFn: (requestId: string) => securityApi.cancelDataDeletion(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "compliance", "requests"] });
      toast.success("Data deletion request canceled");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel deletion request");
    },
  });

  const handleExport = () => {
    exportMutation.mutate({
      format: exportFormat,
      includePII,
    });
  };

  const handleDeletionRequest = () => {
    if (confirmText !== "DELETE") {
      toast.error("Please type 'DELETE' to confirm");
      return;
    }
    deletionMutation.mutate({
      confirmText,
      reason: deletionReason || undefined,
    });
  };

  const getStatusBadge = (status: ComplianceRequest["status"]) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      processing: "secondary",
      completed: "default",
      failed: "destructive",
    };

    const icons = {
      pending: Clock,
      processing: Clock,
      completed: CheckCircle2,
      failed: XCircle,
    };

    const Icon = icons[status] || Clock;

    return (
      <Badge variant={variants[status] || "secondary"} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Your Data
            </CardTitle>
            <CardDescription>
              Request a copy of all your data in JSON or CSV format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setExportModalOpen(true)} className="w-full">
              Request Data Export
            </Button>
          </CardContent>
        </Card>

        <Card className="card-hover border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Your Data
            </CardTitle>
            <CardDescription>
              Permanently delete all your data. This action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setDeletionModalOpen(true)} 
              variant="destructive"
              className="w-full"
            >
              Request Data Deletion
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Request History */}
      <Card>
        <CardHeader>
          <CardTitle>Request History</CardTitle>
          <CardDescription>
            Track the status of your compliance requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : requests && requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      request.type === "export" 
                        ? "bg-primary/10" 
                        : "bg-destructive/10"
                    }`}>
                      {request.type === "export" ? (
                        <Download className={`h-5 w-5 ${
                          request.type === "export" ? "text-primary" : "text-destructive"
                        }`} />
                      ) : (
                        <Trash2 className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {request.type === "export" ? "Data Export" : "Data Deletion"}
                        </h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Requested {format(new Date(request.requestedAt), "PPp")}
                        {request.completedAt && (
                          <> • Completed {format(new Date(request.completedAt), "PPp")}</>
                        )}
                        {request.expiresAt && (
                          <> • Expires {format(new Date(request.expiresAt), "PPp")}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {request.type === "export" && 
                     request.status === "completed" && 
                     request.downloadUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadExportMutation.mutate(request.id)}
                        disabled={downloadExportMutation.isPending}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                    {request.type === "deletion" && 
                     request.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => cancelDeletionMutation.mutate(request.id)}
                        disabled={cancelDeletionMutation.isPending}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No requests yet</h3>
              <p className="text-muted-foreground">
                Your compliance requests will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Modal */}
      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Data Export</DialogTitle>
            <DialogDescription>
              Request a copy of all your data. You'll be notified when the export is ready for download.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <RadioGroup value={exportFormat} onValueChange={(value) => setExportFormat(value as "json" | "csv")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="json" id="json" />
                  <Label htmlFor="json" className="font-normal cursor-pointer">JSON (Recommended)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="csv" />
                  <Label htmlFor="csv" className="font-normal cursor-pointer">CSV</Label>
                </div>
              </RadioGroup>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="includePII">Include Personally Identifiable Information (PII)</Label>
                <p className="text-sm text-muted-foreground">
                  Include sensitive data like email addresses and phone numbers
                </p>
              </div>
              <Switch
                id="includePII"
                checked={includePII}
                onCheckedChange={setIncludePII}
              />
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                Exports may take several minutes to process. You'll receive a notification when ready.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport}
              disabled={exportMutation.isPending}
            >
              {exportMutation.isPending ? "Requesting..." : "Request Export"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deletion Confirmation Modal */}
      <Dialog open={deletionModalOpen} onOpenChange={setDeletionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Request Data Deletion</DialogTitle>
            <DialogDescription>
              This will permanently delete all your data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-destructive">Warning: Irreversible Action</p>
                  <p className="text-sm text-muted-foreground">
                    All your data including agents, sessions, knowledge attachments, and settings will be permanently deleted.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deletionReason">Reason (Optional)</Label>
              <Textarea
                id="deletionReason"
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                placeholder="Help us improve by sharing why you're deleting your account..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmText">
                Type <span className="font-mono font-bold">DELETE</span> to confirm
              </Label>
              <Input
                id="confirmText"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletionModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (confirmText === "DELETE") {
                  setConfirmDeletionOpen(true);
                } else {
                  toast.error("Please type 'DELETE' to confirm");
                }
              }}
              disabled={confirmText !== "DELETE"}
            >
              Request Deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Final Deletion Confirmation */}
      <AlertDialog open={confirmDeletionOpen} onOpenChange={setConfirmDeletionOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All your data will be permanently deleted and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletionRequest}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletionMutation.isPending}
            >
              {deletionMutation.isPending ? "Processing..." : "Yes, delete everything"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
