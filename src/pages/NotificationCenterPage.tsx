import { useState } from "react";
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
  Archive,
  Trash2,
  Filter,
  CheckCheck,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkNotificationAsArchived,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from "@/hooks/useNotifications";
import type { Notification } from "@/types/notification";
import { NotificationModal } from "@/components/notifications/NotificationModal";

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

export function NotificationCenterPage() {
  const [selectedTab, setSelectedTab] = useState<"all" | "unread" | "archived">("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const { data: notifications, isLoading } = useNotifications({
    status: selectedTab === "all" ? undefined : selectedTab,
    type: selectedType === "all" ? undefined : selectedType,
    limit: 100,
  });

  const markAsRead = useMarkNotificationAsRead();
  const markAsArchived = useMarkNotificationAsArchived();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotification = useDeleteNotification();

  const unreadCount = notifications?.filter((n: Notification) => n.status === "unread").length || 0;
  const archivedCount = notifications?.filter((n: Notification) => n.status === "archived").length || 0;

  const handleNotificationClick = (notification: Notification) => {
    if (notification.status === "unread") {
      markAsRead.mutate(notification.id);
    }
    setSelectedNotification(notification);
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
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              Manage your notifications and stay updated
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter notifications by status and type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="session_completed">Session Completed</SelectItem>
                  <SelectItem value="webhook_failed">Webhook Failed</SelectItem>
                  <SelectItem value="billing_invoice">Billing Invoice</SelectItem>
                  <SelectItem value="team_mention">Team Mention</SelectItem>
                  <SelectItem value="admin_alert">Admin Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as typeof selectedTab)}>
              <TabsList>
                <TabsTrigger value="all">
                  All
                  {notifications && notifications.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {notifications.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="unread">
                  Unread
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="archived">
                  Archived
                  {archivedCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {archivedCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab} className="mt-4">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex gap-3 p-4 border rounded-lg">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !notifications || notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Archive className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium text-foreground">No notifications</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedTab === "unread"
                        ? "You have no unread notifications"
                        : selectedTab === "archived"
                        ? "You have no archived notifications"
                        : "You have no notifications"}
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-2">
                      {notifications.map((notification: Notification) => {
                        const Icon = notificationIcons[notification.type] || AlertCircle;
                        const colorClass = notificationColors[notification.type] || "text-primary";
                        const isUnread = notification.status === "unread";
                        const link = getNotificationLink(notification);

                        const content = (
                          <Card
                            className={cn(
                              "transition-all duration-200 hover:shadow-md cursor-pointer",
                              isUnread && "border-primary/50 bg-muted/30"
                            )}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <CardContent className="p-4">
                              <div className="flex gap-4">
                                <div
                                  className={cn(
                                    "flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center",
                                    isUnread ? "bg-primary/10" : "bg-muted"
                                  )}
                                >
                                  <Icon className={cn("h-6 w-6", colorClass)} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <h3
                                          className={cn(
                                            "text-sm font-medium text-foreground",
                                            isUnread && "font-semibold"
                                          )}
                                        >
                                          {notification.title}
                                        </h3>
                                        {isUnread && (
                                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                                        )}
                                      </div>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {notification.content}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-2">
                                        {formatDistanceToNow(new Date(notification.created_at), {
                                          addSuffix: true,
                                        })}
                                      </p>
                                    </div>
                                    <div className="flex gap-1">
                                      {notification.status === "unread" && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead.mutate(notification.id);
                                          }}
                                        >
                                          <CheckCircle2 className="h-4 w-4" />
                                        </Button>
                                      )}
                                      {notification.status !== "archived" && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            markAsArchived.mutate(notification.id);
                                          }}
                                        >
                                          <Archive className="h-4 w-4" />
                                        </Button>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteNotification.mutate(notification.id);
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
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
                  </ScrollArea>
                )}
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>

        {/* Notification Modal */}
        {selectedNotification && (
          <NotificationModal
            notification={selectedNotification}
            open={!!selectedNotification}
            onOpenChange={(open) => !open && setSelectedNotification(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
