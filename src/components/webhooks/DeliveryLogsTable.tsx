import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useDeliveryLogs, useRetryDelivery } from "@/hooks/useWebhooks";
import { format } from "date-fns";
import type { WebhookDelivery } from "@/types/webhook";

interface DeliveryLogsTableProps {
  webhookId?: string;
}

export function DeliveryLogsTable({ webhookId }: DeliveryLogsTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [limit] = useState(50);

  const { data, isLoading, refetch } = useDeliveryLogs({
    webhook_id: webhookId,
    status: statusFilter !== "all" ? (statusFilter as "pending" | "success" | "failed") : undefined,
    limit,
  });

  const retryMutation = useRetryDelivery();

  const getStatusBadge = (status: WebhookDelivery["status"]) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      success: "default",
      pending: "secondary",
      failed: "destructive",
    };
    const icons = {
      success: CheckCircle2,
      pending: Clock,
      failed: AlertCircle,
    };
    const Icon = icons[status];

    return (
      <Badge variant={variants[status] || "secondary"} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const handleRetry = (deliveryId: string) => {
    retryMutation.mutate(deliveryId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  const logs = data?.logs || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No delivery logs</h3>
          <p className="text-muted-foreground">
            Delivery logs will appear here once webhooks are triggered
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Session ID</TableHead>
                <TableHead>Response Code</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Delivered At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {log.session_id.slice(0, 8)}...
                    </code>
                  </TableCell>
                  <TableCell>
                    {log.response_code ? (
                      <span className="font-mono">{log.response_code}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>{log.attempts}</TableCell>
                  <TableCell>
                    {log.delivered_at
                      ? format(new Date(log.delivered_at), "MMM d, yyyy HH:mm")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {log.status === "failed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRetry(log.id)}
                          disabled={retryMutation.isPending}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                      {log.response_body && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const blob = new Blob([log.response_body!], { type: "text/plain" });
                            const url = URL.createObjectURL(blob);
                            window.open(url, "_blank");
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {data && data.total > limit && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {logs.length} of {data.total} logs
        </div>
      )}
    </div>
  );
}
