import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useNotificationPreferences, useUpdateNotificationPreferences } from "@/hooks/useNotifications";
import type { NotificationType, NotificationChannel } from "@/types/notification";

const notificationTypeLabels: Record<NotificationType, string> = {
  session_completed: "Session Completed",
  session_abandoned: "Session Abandoned",
  webhook_failed: "Webhook Failed",
  webhook_success: "Webhook Success",
  billing_invoice: "Billing Invoice",
  billing_payment_failed: "Payment Failed",
  billing_usage_threshold: "Usage Threshold",
  team_mention: "Team Mention",
  team_invite: "Team Invite",
  agent_published: "Agent Published",
  agent_unpublished: "Agent Unpublished",
  knowledge_indexed: "Knowledge Indexed",
  knowledge_index_failed: "Knowledge Index Failed",
  admin_alert: "Admin Alert",
  system_update: "System Update",
};

export function NotificationPreferences() {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();

  const handleToggleEmailNotifications = (enabled: boolean) => {
    updatePreferences.mutate({ email_notifications: enabled });
  };

  const handleToggleInAppNotifications = (enabled: boolean) => {
    updatePreferences.mutate({ in_app_notifications: enabled });
  };

  const handleChangePreferredChannel = (channel: NotificationChannel) => {
    updatePreferences.mutate({ preferred_channels: channel });
  };

  const handleToggleNotificationType = (
    type: NotificationType,
    channel: "email" | "in_app",
    enabled: boolean
  ) => {
    if (!preferences) return;

    const updatedTypes = {
      ...preferences.notification_types,
      [type]: {
        ...preferences.notification_types[type],
        [channel]: enabled,
      },
    };

    updatePreferences.mutate({ notification_types: updatedTypes });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!preferences) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Unable to load notification preferences. Please try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Configure how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Notifications Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications" className="text-base">
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences.email_notifications}
              onCheckedChange={handleToggleEmailNotifications}
              disabled={updatePreferences.isPending}
            />
          </div>

          <Separator />

          {/* In-App Notifications Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="in-app-notifications" className="text-base">
                In-App Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Show notifications in the application
              </p>
            </div>
            <Switch
              id="in-app-notifications"
              checked={preferences.in_app_notifications}
              onCheckedChange={handleToggleInAppNotifications}
              disabled={updatePreferences.isPending}
            />
          </div>

          <Separator />

          {/* Preferred Channel */}
          <div className="space-y-2">
            <Label htmlFor="preferred-channel">Preferred Channel</Label>
            <Select
              value={preferences.preferred_channels}
              onValueChange={(value) => handleChangePreferredChannel(value as NotificationChannel)}
              disabled={updatePreferences.isPending}
            >
              <SelectTrigger id="preferred-channel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email Only</SelectItem>
                <SelectItem value="in_app">In-App Only</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Default channel for notifications when both are enabled
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Type Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Customize which notifications you receive for each type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(preferences.notification_types).map(([type, settings], index) => {
              const typedSettings = settings as { email: boolean; in_app: boolean };
              return (
              <div key={type}>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-3">
                      {notificationTypeLabels[type as NotificationType]}
                    </h4>
                    <div className="space-y-3 pl-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`${type}-email`} className="text-sm font-normal">
                          Email
                        </Label>
                        <Switch
                          id={`${type}-email`}
                          checked={typedSettings.email}
                          onCheckedChange={(enabled) =>
                            handleToggleNotificationType(type as NotificationType, "email", enabled)
                          }
                          disabled={
                            updatePreferences.isPending || !preferences.email_notifications
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`${type}-in-app`} className="text-sm font-normal">
                          In-App
                        </Label>
                        <Switch
                          id={`${type}-in-app`}
                          checked={typedSettings.in_app}
                          onCheckedChange={(enabled) =>
                            handleToggleNotificationType(type as NotificationType, "in_app", enabled)
                          }
                          disabled={
                            updatePreferences.isPending || !preferences.in_app_notifications
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {index < Object.keys(preferences.notification_types).length - 1 && (
                  <Separator className="mt-6" />
                )}
              </div>
            );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
