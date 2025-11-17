import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { settingsApi } from "@/lib/api/settings";
import { toast } from "sonner";
import { Shield, Smartphone, Monitor, Trash2, LogOut } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export function SecuritySection() {
  const queryClient = useQueryClient();

  const { data: securitySettings, isLoading: settingsLoading } = useQuery({
    queryKey: ["settings", "security"],
    queryFn: () => settingsApi.getSecuritySettings(),
  });

  const { data: sessionHistory, isLoading: sessionsLoading } = useQuery({
    queryKey: ["settings", "security", "sessions"],
    queryFn: () => settingsApi.getSessionHistory(),
  });

  const { data: securityLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["settings", "security", "logs"],
    queryFn: () => settingsApi.getSecurityLogs(20),
  });

  const updateSecurityMutation = useMutation({
    mutationFn: (data: { twoFactorEnabled?: boolean; ssoEnabled?: boolean }) =>
      settingsApi.updateSecuritySettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "security"] });
      toast.success("Security settings updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update security settings");
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
      settingsApi.updatePassword(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "user"] });
      toast.success("Password updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update password");
    },
  });

  const revokeSessionMutation = useMutation({
    mutationFn: (id: string) => settingsApi.revokeSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "security", "sessions"] });
      toast.success("Session revoked successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to revoke session");
    },
  });

  const revokeAllSessionsMutation = useMutation({
    mutationFn: () => settingsApi.revokeAllSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "security", "sessions"] });
      toast.success("All sessions revoked successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to revoke sessions");
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmitPassword = async (data: PasswordFormData) => {
    await updatePasswordMutation.mutateAsync(data);
    reset();
  };

  const handleToggle2FA = (enabled: boolean) => {
    updateSecurityMutation.mutate({ twoFactorEnabled: enabled });
  };

  const handleToggleSSO = (enabled: boolean) => {
    updateSecurityMutation.mutate({ ssoEnabled: enabled });
  };

  if (settingsLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your account password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                {...register("currentPassword")}
                className={errors.currentPassword ? "border-destructive" : ""}
              />
              {errors.currentPassword && (
                <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                {...register("newPassword")}
                className={errors.newPassword ? "border-destructive" : ""}
              />
              {errors.newPassword && (
                <p className="text-sm text-destructive">{errors.newPassword.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters with uppercase, lowercase, and numbers
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                {...register("confirmPassword")}
                className={errors.confirmPassword ? "border-destructive" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={updatePasswordMutation.isPending}
              className="btn-hover"
            >
              {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>
            Manage two-factor authentication and SSO
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="2fa-toggle">Two-Factor Authentication</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              id="2fa-toggle"
              checked={securitySettings?.twoFactorEnabled || false}
              onCheckedChange={handleToggle2FA}
              disabled={updateSecurityMutation.isPending}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="sso-toggle">Single Sign-On (SSO)</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Enable SSO for your workspace
              </p>
            </div>
            <Switch
              id="sso-toggle"
              checked={securitySettings?.ssoEnabled || false}
              onCheckedChange={handleToggleSSO}
              disabled={updateSecurityMutation.isPending}
            />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              For comprehensive security, privacy, and compliance management including encryption settings, 
              audit logs, data export/deletion, and PII management, visit the dedicated Security & Privacy page.
            </p>
            <Link to="/security">
              <Button variant="outline" size="sm" className="btn-hover">
                Go to Security & Privacy
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="card-hover">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Manage your active login sessions
              </CardDescription>
            </div>
            {sessionHistory && sessionHistory.length > 1 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <LogOut className="mr-2 h-4 w-4" />
                    Revoke All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Revoke All Sessions?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will log you out of all devices except this one. You'll need to log in again on other devices.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => revokeAllSessionsMutation.mutate()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Revoke All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : sessionHistory && sessionHistory.length > 0 ? (
            <div className="space-y-4">
              {sessionHistory.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Monitor className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{session.device}</h3>
                        {session.current && (
                          <Badge variant="default">Current</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        {session.location && <span>{session.location}</span>}
                        <span>{session.ipAddress}</span>
                        <span>Last active {format(new Date(session.lastActive), "MMM d, yyyy 'at' h:mm a")}</span>
                      </div>
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => revokeSessionMutation.mutate(session.id)}
                      disabled={revokeSessionMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No active sessions</p>
          )}
        </CardContent>
      </Card>

      {/* Security Logs */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle>Security Logs</CardTitle>
          <CardDescription>
            Recent security-related activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : securityLogs && securityLogs.length > 0 ? (
            <div className="space-y-4">
              {securityLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <h3 className="font-semibold">{log.actionType}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>{format(new Date(log.timestamp), "MMM d, yyyy 'at' h:mm a")}</span>
                      {log.ipAddress && <span>{log.ipAddress}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No security logs available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
