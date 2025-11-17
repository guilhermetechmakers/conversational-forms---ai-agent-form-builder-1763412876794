import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Download, Trash2, AlertTriangle } from "lucide-react";

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required to confirm deletion"),
});

type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;

export function DataPrivacySection() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const exportMutation = useMutation({
    mutationFn: () => settingsApi.exportData(),
    onSuccess: (data) => {
      // Create a download link
      const link = document.createElement("a");
      link.href = data.downloadUrl;
      link.download = `data-export-${new Date().toISOString().split("T")[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Data export started. Your download will begin shortly.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export data");
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (password: string) => settingsApi.deleteAccount(password),
    onSuccess: () => {
      toast.success("Account deletion initiated. You will be logged out shortly.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete account");
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
  });

  const onSubmitDelete = async (data: DeleteAccountFormData) => {
    await deleteAccountMutation.mutateAsync(data.password);
    reset();
    setDeleteDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Data Export */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle>Export Your Data</CardTitle>
          <CardDescription>
            Download a copy of all your data in a portable format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your export will include all agents, sessions, settings, and associated data. 
            The export will be available for download for 7 days.
          </p>
          <Button
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
            className="btn-hover"
          >
            <Download className="mr-2 h-4 w-4" />
            {exportMutation.isPending ? "Preparing Export..." : "Export Data"}
          </Button>
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle>Data Retention</CardTitle>
          <CardDescription>
            Configure how long your data is retained
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Set the retention period for your workspace data. Data older than the retention period 
            will be automatically deleted according to your settings.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Data retention settings are managed at the workspace level. Contact support to configure 
              custom retention policies.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Controls */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle>Privacy Controls</CardTitle>
          <CardDescription>
            Manage your privacy and data sharing preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Data Sharing</h3>
            <p className="text-sm text-muted-foreground">
              Control how your data is used for product improvements and analytics.
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Cookies</h3>
            <p className="text-sm text-muted-foreground">
              Manage cookie preferences and tracking settings.
            </p>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              For comprehensive privacy and compliance management, visit the Security & Privacy page.
            </p>
            <Button variant="outline" size="sm" asChild className="btn-hover">
              <a href="/security">Go to Security & Privacy</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Deletion */}
      <Card className="card-hover border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Delete Account</CardTitle>
          </div>
          <CardDescription>
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
            <p className="text-sm text-destructive font-medium mb-2">
              Warning: This action cannot be undone
            </p>
            <p className="text-sm text-muted-foreground">
              Deleting your account will permanently remove all your data, including:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
              <li>All agents and their configurations</li>
              <li>All session data and transcripts</li>
              <li>All uploaded knowledge attachments</li>
              <li>All webhook configurations</li>
              <li>All billing and subscription information</li>
            </ul>
          </div>
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="btn-hover">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>
                    This action cannot be undone. This will permanently delete your account 
                    and remove all your data from our servers.
                  </p>
                  <p className="font-medium">
                    Please enter your password to confirm:
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <form onSubmit={handleSubmit(onSubmitDelete)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="delete-password">Password</Label>
                  <Input
                    id="delete-password"
                    type="password"
                    {...register("password")}
                    className={errors.password ? "border-destructive" : ""}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    type="submit"
                    disabled={deleteAccountMutation.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </form>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
