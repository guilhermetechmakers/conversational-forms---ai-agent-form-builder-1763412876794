import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { settingsApi } from "@/lib/api/settings";
import { toast } from "sonner";
import { Upload, CheckCircle2 } from "lucide-react";

const accountSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Invalid email address"),
  company: z.string().max(100, "Company name is too long").optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

export function AccountInfoSection() {
  const queryClient = useQueryClient();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { data: user, isLoading } = useQuery({
    queryKey: ["settings", "user"],
    queryFn: () => settingsApi.getUser(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { name?: string; email?: string; company?: string; avatar?: string }) =>
      settingsApi.updateUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "user"] });
      toast.success("Account information updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update account information");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      company: user?.company || "",
    },
    values: user ? {
      name: user.name,
      email: user.email,
      company: user.company || "",
    } : undefined,
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Avatar image must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: AccountFormData) => {
    try {
      // TODO: Upload avatar to S3/CDN if avatarFile is set
      // For now, we'll just update the text fields
      await updateMutation.mutateAsync({
        name: data.name,
        email: data.email,
        company: data.company,
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

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>
          Update your personal information and profile settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            {avatarPreview ? (
              <AvatarImage src={avatarPreview} alt="Avatar preview" />
            ) : user?.avatar ? (
              <AvatarImage src={user.avatar} alt={user.name} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Label htmlFor="avatar-upload" className="cursor-pointer">
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Avatar
                </span>
              </Button>
            </Label>
            <Input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <p className="text-xs text-muted-foreground">
              JPG, PNG or GIF. Max size 5MB
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
            {user?.emailVerified && (
              <div className="flex items-center gap-2 text-sm text-accent">
                <CheckCircle2 className="h-4 w-4" />
                <span>Email verified</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company (Optional)</Label>
            <Input
              id="company"
              {...register("company")}
              className={errors.company ? "border-destructive" : ""}
            />
            {errors.company && (
              <p className="text-sm text-destructive">{errors.company.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Account created {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""}
            </div>
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
  );
}
