import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  useCriticalAlerts,
  useAcknowledgeAlert,
  useResolveAlert,
} from "@/hooks/useNotifications";

const severityColors: Record<string, { bg: string; text: string; border: string }> = {
  low: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  medium: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
  },
  high: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  critical: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
};

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  active: AlertTriangle,
  acknowledged: Clock,
  resolved: CheckCircle2,
};

export function AdminCriticalAlerts() {
  const { data: alerts, isLoading } = useCriticalAlerts({
    status: "active",
    limit: 50,
  });
  const acknowledgeAlert = useAcknowledgeAlert();
  const resolveAlert = useResolveAlert();

  const activeAlerts = alerts?.filter((a: { status: string }) => a.status === "active") || [];
  const acknowledgedAlerts = alerts?.filter((a: { status: string }) => a.status === "acknowledged") || [];
  const criticalCount = activeAlerts.filter((a: { severity: string }) => a.severity === "critical").length;
  const highCount = activeAlerts.filter((a: { severity: string }) => a.severity === "high").length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Critical Alerts
            </CardTitle>
            <CardDescription className="mt-1">
              Monitor and manage system-critical alerts
            </CardDescription>
          </div>
          {activeAlerts.length > 0 && (
            <div className="flex gap-2">
              <Badge variant="destructive">{criticalCount} Critical</Badge>
              {highCount > 0 && <Badge variant="outline">{highCount} High</Badge>}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 p-4 border rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : activeAlerts.length === 0 && acknowledgedAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-accent mb-3" />
            <p className="text-sm font-medium text-foreground">All clear!</p>
            <p className="text-xs text-muted-foreground mt-1">
              No active critical alerts at this time
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {/* Active Alerts */}
              {activeAlerts.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-foreground">
                    Active Alerts ({activeAlerts.length})
                  </h3>
                  <div className="space-y-3">
                    {activeAlerts.map((alert: { id: string; severity: string; status: string; description: string; event_type: string; created_at: string; retry_count: number }) => {
                      const severity = severityColors[alert.severity] || severityColors.medium;
                      const StatusIcon = statusIcons[alert.status] || AlertTriangle;

                      return (
                        <Card
                          key={alert.id}
                          className={cn(
                            "border-2 transition-all duration-200 hover:shadow-md",
                            severity.border
                          )}
                        >
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <div
                                className={cn(
                                  "flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center",
                                  severity.bg
                                )}
                              >
                                <StatusIcon className={cn("h-6 w-6", severity.text)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="text-sm font-semibold text-foreground">
                                        {alert.description}
                                      </h4>
                                      <Badge
                                        variant={
                                          alert.severity === "critical"
                                            ? "destructive"
                                            : alert.severity === "high"
                                            ? "default"
                                            : "secondary"
                                        }
                                      >
                                        {alert.severity}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {alert.event_type.replace(/_/g, " ").toUpperCase()} •{" "}
                                      {formatDistanceToNow(new Date(alert.created_at), {
                                        addSuffix: true,
                                      })}
                                    </p>
                                    {alert.retry_count > 0 && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Retry attempts: {alert.retry_count}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2 mt-3">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => acknowledgeAlert.mutate(alert.id)}
                                    disabled={acknowledgeAlert.isPending}
                                  >
                                    <Clock className="mr-2 h-4 w-4" />
                                    Acknowledge
                                  </Button>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => resolveAlert.mutate(alert.id)}
                                    disabled={resolveAlert.isPending}
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Resolve
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Acknowledged Alerts */}
              {acknowledgedAlerts.length > 0 && (
                <>
                  {activeAlerts.length > 0 && <Separator className="my-4" />}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                      Acknowledged Alerts ({acknowledgedAlerts.length})
                    </h3>
                    <div className="space-y-3">
                      {acknowledgedAlerts.map((alert: { id: string; severity: string; status: string; description: string; acknowledged_at?: string }) => {
                        const severity = severityColors[alert.severity] || severityColors.medium;
                        const StatusIcon = statusIcons[alert.status] || Clock;

                        return (
                          <Card
                            key={alert.id}
                            className={cn(
                              "border transition-all duration-200 opacity-75",
                              severity.border
                            )}
                          >
                            <CardContent className="p-4">
                              <div className="flex gap-4">
                                <div
                                  className={cn(
                                    "flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center",
                                    severity.bg
                                  )}
                                >
                                  <StatusIcon className={cn("h-6 w-6", severity.text)} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-sm font-medium text-foreground">
                                          {alert.description}
                                        </h4>
                                        <Badge variant="secondary">{alert.severity}</Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        Acknowledged{" "}
                                        {alert.acknowledged_at &&
                                          formatDistanceToNow(new Date(alert.acknowledged_at), {
                                            addSuffix: true,
                                          })}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 mt-3">
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => resolveAlert.mutate(alert.id)}
                                      disabled={resolveAlert.isPending}
                                    >
                                      <CheckCircle2 className="mr-2 h-4 w-4" />
                                      Resolve
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
