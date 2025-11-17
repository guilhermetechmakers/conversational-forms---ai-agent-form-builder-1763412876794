import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, Clock, Download, Send, UserPlus, FileText, Tag as TagIcon, Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { SessionActivity } from "@/types/session";
import type { WebhookDelivery } from "@/types/webhook";

interface ActivityLogProps {
  activities?: SessionActivity[];
  webhookDeliveries?: WebhookDelivery[];
}

export function ActivityLog({ activities = [], webhookDeliveries = [] }: ActivityLogProps) {
  const getActivityIcon = (actionType: string) => {
    switch (actionType) {
      case 'webhook_sent':
      case 'webhook_failed':
        return <Send className="h-4 w-4" />;
      case 'export_csv':
      case 'export_json':
        return <Download className="h-4 w-4" />;
      case 'crm_contact_created':
        return <UserPlus className="h-4 w-4" />;
      case 'note_added':
        return <FileText className="h-4 w-4" />;
      case 'tag_added':
        return <TagIcon className="h-4 w-4" />;
      case 'session_deleted':
        return <Trash2 className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-accent" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const formatActionType = (actionType: string) => {
    return actionType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Combine activities and webhook deliveries, sort by date
  const allItems = [
    ...activities.map(activity => ({
      type: 'activity' as const,
      id: activity.id,
      action: activity.action_type,
      status: activity.status,
      timestamp: activity.created_at,
      details: activity.details,
    })),
    ...webhookDeliveries.map(delivery => ({
      type: 'webhook' as const,
      id: delivery.id,
      action: 'webhook_sent',
      status: delivery.status,
      timestamp: delivery.delivered_at || delivery.created_at,
      details: {
        attempts: delivery.attempts,
        error_message: delivery.error_message,
        response_code: delivery.response_code,
      },
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
        <CardDescription>
          Track webhook attempts, exports, and other session activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {allItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activity recorded yet
            </div>
          ) : (
            <div className="space-y-3">
              {allItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(item.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {formatActionType(item.action)}
                      </span>
                      {getStatusIcon(item.status)}
                      <Badge
                        variant={
                          item.status === 'success'
                            ? 'default'
                            : item.status === 'failed'
                            ? 'destructive'
                            : 'secondary'
                        }
                        className="text-xs"
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">
                      {format(new Date(item.timestamp), 'MMM d, yyyy HH:mm:ss')}
                    </div>
                    {item.details && Object.keys(item.details).length > 0 && (
                      <div className="text-xs text-muted-foreground mt-2 space-y-1">
                        {item.details.attempts !== undefined && item.details.attempts !== null && (
                          <div>Attempts: {String(item.details.attempts)}</div>
                        )}
                        {item.details.response_code !== undefined && item.details.response_code !== null && (
                          <div>Response Code: {String(item.details.response_code)}</div>
                        )}
                        {(() => {
                          const errorMsg = item.details.error_message;
                          return errorMsg && typeof errorMsg === 'string' ? (
                            <div className="text-destructive">
                              Error: {errorMsg}
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
