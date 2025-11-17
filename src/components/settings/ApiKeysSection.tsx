import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { settingsApi } from "@/lib/api/settings";
import { toast } from "sonner";
import { Key, Plus, Copy, Trash2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

const apiKeySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  expiresInDays: z.number().min(1).max(365).optional(),
});

type ApiKeyFormData = z.infer<typeof apiKeySchema>;

export function ApiKeysSection() {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState<{ key: string; name: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ["settings", "api-keys"],
    queryFn: () => settingsApi.getApiKeys(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; expiresInDays?: number }) =>
      settingsApi.createApiKey(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["settings", "api-keys"] });
      setNewApiKey({ key: response.key, name: response.apiKey.name });
      setCreateDialogOpen(false);
      toast.success("API key created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create API key");
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => settingsApi.revokeApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "api-keys"] });
      toast.success("API key revoked successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to revoke API key");
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApiKeyFormData>({
    resolver: zodResolver(apiKeySchema),
  });

  const onSubmit = async (data: ApiKeyFormData) => {
    await createMutation.mutateAsync({
      name: data.name,
      expiresInDays: data.expiresInDays,
    });
    reset();
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    toast.success("API key copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      revoked: "destructive",
      expired: "secondary",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="card-hover">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage API keys for programmatic access to your workspace
              </CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)} className="btn-hover">
              <Plus className="mr-2 h-4 w-4" />
              Create API Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {apiKeys && apiKeys.length > 0 ? (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Key className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{apiKey.name}</h3>
                        {getStatusBadge(apiKey.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {apiKey.keyPrefix}••••••••
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>Created {format(new Date(apiKey.createdAt), "MMM d, yyyy")}</span>
                        {apiKey.lastUsedAt && (
                          <span>Last used {format(new Date(apiKey.lastUsedAt), "MMM d, yyyy")}</span>
                        )}
                        {apiKey.expiresAt && (
                          <span>Expires {format(new Date(apiKey.expiresAt), "MMM d, yyyy")}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {apiKey.status === "active" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. Applications using this key will lose access immediately.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => revokeMutation.mutate(apiKey.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Revoke
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No API keys</h3>
              <p className="text-muted-foreground mb-4">
                Create an API key to access your workspace programmatically
              </p>
              <Button onClick={() => setCreateDialogOpen(true)} className="btn-hover">
                <Plus className="mr-2 h-4 w-4" />
                Create API Key
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create API Key Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Create a new API key for programmatic access. Make sure to copy it - you won't be able to see it again.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="key-name">Key Name</Label>
              <Input
                id="key-name"
                placeholder="Production API Key"
                {...register("name")}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="expires-in">Expires In (Days, Optional)</Label>
              <Input
                id="expires-in"
                type="number"
                placeholder="90"
                {...register("expiresInDays", { valueAsNumber: true })}
                className={errors.expiresInDays ? "border-destructive" : ""}
              />
              {errors.expiresInDays && (
                <p className="text-sm text-destructive">{errors.expiresInDays.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending} className="btn-hover">
                {createMutation.isPending ? "Creating..." : "Create Key"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New API Key Display Dialog */}
      {newApiKey && (
        <Dialog open={!!newApiKey} onOpenChange={() => setNewApiKey(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>API Key Created</DialogTitle>
              <DialogDescription>
                Copy your API key now. You won't be able to see it again.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Your API Key</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={newApiKey.key}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(newApiKey.key)}
                  >
                    {copiedKey === newApiKey.key ? (
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Important:</strong> Store this key securely. It provides full access to your workspace.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setNewApiKey(null)} className="btn-hover">
                I've Copied It
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
