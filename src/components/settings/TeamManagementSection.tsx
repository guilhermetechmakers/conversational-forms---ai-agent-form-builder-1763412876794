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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Users, Plus, Mail, UserX, Shield, Edit, Eye } from "lucide-react";
import { format } from "date-fns";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "editor", "viewer"]),
});

type InviteFormData = z.infer<typeof inviteSchema>;

export function TeamManagementSection() {
  const queryClient = useQueryClient();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ["settings", "team"],
    queryFn: () => settingsApi.getTeamMembers(),
  });

  const inviteMutation = useMutation({
    mutationFn: (data: { email: string; role: "admin" | "editor" | "viewer" }) =>
      settingsApi.inviteTeamMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "team"] });
      setInviteDialogOpen(false);
      toast.success("Invitation sent successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send invitation");
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: "admin" | "editor" | "viewer" }) =>
      settingsApi.updateTeamMember(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "team"] });
      toast.success("Member role updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update member role");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => settingsApi.removeTeamMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "team"] });
      toast.success("Team member removed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove team member");
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      role: "viewer",
    },
  });

  const role = watch("role");

  const onSubmit = async (data: InviteFormData) => {
    await inviteMutation.mutateAsync(data);
    reset();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Shield className="h-4 w-4" />;
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "editor":
        return <Edit className="h-4 w-4" />;
      case "viewer":
        return <Eye className="h-4 w-4" />;
      default:
        return <UserX className="h-4 w-4" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary"> = {
      owner: "default",
      admin: "default",
      editor: "secondary",
      viewer: "secondary",
    };
    return (
      <Badge variant={variants[role] || "secondary"} className="flex items-center gap-1">
        {getRoleIcon(role)}
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      pending: "secondary",
      suspended: "destructive",
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
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage team members and their access levels
              </CardDescription>
            </div>
            <Button onClick={() => setInviteDialogOpen(true)} className="btn-hover">
              <Plus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {teamMembers && teamMembers.length > 0 ? (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar>
                      {member.avatar ? (
                        <AvatarImage src={member.avatar} alt={member.name} />
                      ) : null}
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {member.name?.charAt(0).toUpperCase() || member.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{member.name || member.email}</h3>
                        {getRoleBadge(member.role)}
                        {getStatusBadge(member.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </span>
                        {member.joinedAt ? (
                          <span>Joined {format(new Date(member.joinedAt), "MMM d, yyyy")}</span>
                        ) : (
                          <span>Invited {format(new Date(member.invitedAt), "MMM d, yyyy")}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.role !== "owner" && member.status === "active" && (
                      <Select
                        value={member.role}
                        onValueChange={(value) =>
                          updateRoleMutation.mutate({
                            id: member.id,
                            role: value as "admin" | "editor" | "viewer",
                          })
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    {member.role !== "owner" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <UserX className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {member.name || member.email} will lose access to this workspace. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeMutation.mutate(member.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No team members</h3>
              <p className="text-muted-foreground mb-4">
                Invite team members to collaborate on your workspace
              </p>
              <Button onClick={() => setInviteDialogOpen(true)} className="btn-hover">
                <Plus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your workspace
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@example.com"
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select value={role} onValueChange={(value) => setValue("role", value as "admin" | "editor" | "viewer")}>
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    Admin - Full access to workspace
                  </SelectItem>
                  <SelectItem value="editor">
                    Editor - Can create and edit agents
                  </SelectItem>
                  <SelectItem value="viewer">
                    Viewer - Read-only access
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={inviteMutation.isPending} className="btn-hover">
                {inviteMutation.isPending ? "Sending..." : "Send Invitation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
