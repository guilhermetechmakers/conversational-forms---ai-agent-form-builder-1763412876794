import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  DollarSign,
  Users,
  MessageSquare,
  FileText,
  Loader2,
  BellOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/notification";
import {
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "@/hooks/useNotifications";

interface NotificationDropdownProps {
  notifications: Notification[];
  isLoading: boolean;
  onClose: () => void;
}

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

export function NotificationDropdown({
  notifications,
  isLoading,
  onClose,
}: NotificationDropdownProps) {
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const handleNotificationClick = (notification: Notification) => {
    if (notification.status === "unread") {
      markAsRead.mutate(notification.id);
    }
    onClose();
  };

  const handleMarkAllRead = () => {
    markAllAsRead.mutate();
  };

  const getNotificationLink = (notification: Notification): string | null => {
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

  return (
    <div className="flex flex-col max-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-lg">Notifications</h3>
        {notifications.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markAllAsRead.isPending}
            className="h-8 text-xs"
          >
            {markAllAsRead.isPending ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              "Mark all read"
            )}
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <BellOff className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground">All caught up!</p>
            <p className="text-xs text-muted-foreground mt-1">
              You have no unread notifications
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => {
              const Icon = notificationIcons[notification.type] || AlertCircle;
              const colorClass = notificationColors[notification.type] || "text-primary";
              const link = getNotificationLink(notification);
              const isUnread = notification.status === "unread";

              const content = (
                <div
                  className={cn(
                    "flex gap-3 p-4 transition-colors cursor-pointer",
                    isUnread && "bg-muted/50",
                    "hover:bg-muted"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div
                    className={cn(
                      "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
                      isUnread ? "bg-primary/10" : "bg-muted"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", colorClass)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm font-medium text-foreground line-clamp-1",
                          isUnread && "font-semibold"
                        )}
                      >
                        {notification.title}
                      </p>
                      {isUnread && (
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              );

              return link ? (
                <Link key={notification.id} to={link}>
                  {content}
                </Link>
              ) : (
                <div key={notification.id}>{content}</div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <Separator />
          <div className="p-3">
            <Link to="/notifications">
              <Button
                variant="ghost"
                className="w-full justify-center text-sm"
                onClick={onClose}
              >
                View all notifications
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
