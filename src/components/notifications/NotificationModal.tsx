import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  DollarSign,
  Users,
  MessageSquare,
  FileText,
  Archive,
  Trash2,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/notification";
import {
  useMarkNotificationAsRead,
  useMarkNotificationAsArchived,
  useDeleteNotification,
} from "@/hooks/useNotifications";
import { Link } from "react-router-dom";

const notificationIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  session_completed: CheckCircle2,
  session_abandoned: XCircle,
  webhook_failed: AlertCircle,
  webhook_success: CheckCircle2,
  billing_invoice: DollarSign,
  billing_payment_failed: AlertCircle,
  billing_usage_threshold: AlertCircle,
  team_mention: Users,
  team_invite: Users,
  agent_published: MessageSquare,
  agent_unpublished: MessageSquare,
  knowledge_indexed: CheckCircle2,
  knowledge_index_failed: AlertCircle,
  admin_alert: AlertCircle,
  system_update: FileText,
};

const notificationColors: Record<string, string> = {
  session_completed: "text-accent",
  session_abandoned: "text-muted-foreground",
  webhook_failed: "text-destructive",
  webhook_success: "text-accent",
  billing_invoice: "text-primary",
  billing_payment_failed: "text-destructive",
  billing_usage_threshold: "text-destructive",
  team_mention: "text-primary",
  team_invite: "text-primary",
  agent_published: "text-accent",
  agent_unpublished: "text-muted-foreground",
  knowledge_indexed: "text-accent",
  knowledge_index_failed: "text-destructive",
  admin_alert: "text-destructive",
  system_update: "text-primary",
};

interface NotificationModalProps {
  notification: Notification;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationModal({
  notification,
  open,
  onOpenChange,
}: NotificationModalProps) {
  const markAsRead = useMarkNotificationAsRead();
  const markAsArchived = useMarkNotificationAsArchived();
  const deleteNotification = useDeleteNotification();

  const Icon = notificationIcons[notification.type] || AlertCircle;
  const colorClass = notificationColors[notification.type] || "text-primary";
  const isUnread = notification.status === "unread";

  const getNotificationLink = (): string | null => {
    if (notification.metadata?.link) {
      return notification.metadata.link as string;
    }
    if (notification.metadata?.session_id) {
      return `/sessions/${notification.metadata.session_id}`;
    }
    if (notification.metadata?.agent_id) {
      return `/agents/${notification.metadata.agent_id}/edit`;
    }
    return null;
  };

  const handleMarkAsRead = () => {
    if (isUnread) {
      markAsRead.mutate(notification.id);
    }
  };

  const handleArchive = () => {
    markAsArchived.mutate(notification.id);
    onOpenChange(false);
  };

  const handleDelete = () => {
    deleteNotification.mutate(notification.id);
    onOpenChange(false);
  };

  const link = getNotificationLink();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl animate-fade-in-up">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex-shrink-0 h-14 w-14 rounded-full flex items-center justify-center",
                isUnread ? "bg-primary/10" : "bg-muted"
              )}
            >
              <Icon className={cn("h-7 w-7", colorClass)} />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{notification.title}</DialogTitle>
              <DialogDescription className="mt-2">
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                })}
                {isUnread && (
                  <Badge variant="default" className="ml-2">
                    Unread
                  </Badge>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <div className="space-y-4">
          <div>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {notification.content}
            </p>
          </div>

          {notification.metadata && Object.keys(notification.metadata).length > 0 && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <h4 className="text-sm font-semibold mb-2">Details</h4>
              <dl className="space-y-2 text-sm">
                {Object.entries(notification.metadata).map(([key, value]) => {
                  if (key === "link") return null;
                  return (
                    <div key={key} className="flex justify-between">
                      <dt className="text-muted-foreground capitalize">
                        {key.replace(/_/g, " ")}:
                      </dt>
                      <dd className="font-medium text-foreground">
                        {typeof value === "object" ? JSON.stringify(value) : String(value)}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {isUnread && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAsRead}
                  disabled={markAsRead.isPending}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as read
                </Button>
              )}
              {notification.status !== "archived" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleArchive}
                  disabled={markAsArchived.isPending}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={deleteNotification.isPending}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
            {link && (
              <Link to={link}>
                <Button variant="default" size="sm" onClick={() => onOpenChange(false)}>
                  View Details
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
