import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { settingsApi } from "@/lib/api/settings";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";

const workspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(100, "Name is too long"),
  slug: z.string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug is too long")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  customDomain: z.string()
    .regex(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/, "Invalid domain format")
    .optional()
    .or(z.literal("")),
  slugPolicy: z.enum(["strict", "flexible"]).optional(),
});

type WorkspaceFormData = z.infer<typeof workspaceSchema>;

export function WorkspaceSettingsSection() {
  const queryClient = useQueryClient();

  const { data: workspace, isLoading } = useQuery({
    queryKey: ["settings", "workspace"],
    queryFn: () => settingsApi.getWorkspace(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: {
      name?: string;
      slug?: string;
      customDomain?: string;
      slugPolicy?: "strict" | "flexible";
    }) => settingsApi.updateWorkspace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "workspace"] });
      toast.success("Workspace settings updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update workspace settings");
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    values: workspace ? {
      name: workspace.name,
      slug: workspace.slug,
      customDomain: workspace.customDomain || "",
      slugPolicy: workspace.slugPolicy || "flexible",
    } : undefined,
  });

  const slugPolicy = watch("slugPolicy");

  const onSubmit = async (data: WorkspaceFormData) => {
    try {
      await updateMutation.mutateAsync({
        name: data.name,
        slug: data.slug,
        customDomain: data.customDomain || undefined,
        slugPolicy: data.slugPolicy,
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  const publicUrl = workspace
    ? `${window.location.origin}/a/${workspace.slug}`
    : "";

  return (
    <div className="space-y-6">
      <Card className="card-hover">
        <CardHeader>
          <CardTitle>Workspace Settings</CardTitle>
          <CardDescription>
            Configure your workspace name, slug, and domain settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Workspace Name</Label>
              <Input
                id="workspace-name"
                {...register("name")}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="workspace-slug">Workspace Slug</Label>
              <Input
                id="workspace-slug"
                {...register("slug")}
                className={errors.slug ? "border-destructive" : ""}
              />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              )}
              {publicUrl && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Public URL:</span>
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    {publicUrl}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-domain">Custom Domain (Optional)</Label>
              <Input
                id="custom-domain"
                placeholder="example.com"
                {...register("customDomain")}
                className={errors.customDomain ? "border-destructive" : ""}
              />
              {errors.customDomain && (
                <p className="text-sm text-destructive">{errors.customDomain.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Configure DNS CNAME record pointing to your workspace
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug-policy">Slug Policy</Label>
              <Select
                value={slugPolicy}
                onValueChange={(value) => setValue("slugPolicy", value as "strict" | "flexible")}
              >
                <SelectTrigger id="slug-policy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flexible">Flexible - Allow automatic adjustments</SelectItem>
                  <SelectItem value="strict">Strict - Require exact match</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Controls how agent slugs are validated and generated
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={!isDirty || updateMutation.isPending}
                className="btn-hover"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default Agent Settings</CardTitle>
          <CardDescription>
            Configure default settings for new agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Default agent settings can be configured when creating a new agent in the Agent Builder.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
