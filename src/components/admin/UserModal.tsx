import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminApi } from "@/lib/api/admin";
import type { AdminUser, UpdateUserRoleInput } from "@/types/admin";
import { toast } from "sonner";
import { useState } from "react";

interface UserModalProps {
  user: AdminUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserModal({ user, open, onOpenChange }: UserModalProps) {
  const [role, setRole] = useState<AdminUser['role']>(user.role);
  const queryClient = useQueryClient();

  const updateRoleMutation = useMutation({
    mutationFn: (data: UpdateUserRoleInput) => adminApi.updateUserRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User role updated successfully');
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user role');
    },
  });

  const handleRoleUpdate = () => {
    if (role !== user.role) {
      updateRoleMutation.mutate({ user_id: user.id, role });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            View and manage user information and permissions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user.email} disabled />
          </div>

          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={user.full_name || 'Not set'} disabled />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as AdminUser['role'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <div>
              <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                {user.status}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email Verified</Label>
            <div>
              <Badge variant={user.email_verified ? 'default' : 'secondary'}>
                {user.email_verified ? 'Verified' : 'Unverified'}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label>2FA Enabled</Label>
            <div>
              <Badge variant={user.two_factor_enabled ? 'default' : 'outline'}>
                {user.two_factor_enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Created At</Label>
            <Input
              value={new Date(user.created_at).toLocaleString()}
              disabled
            />
          </div>

          {user.last_login_at && (
            <div className="space-y-2">
              <Label>Last Login</Label>
              <Input
                value={new Date(user.last_login_at).toLocaleString()}
                disabled
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {role !== user.role && (
            <Button
              onClick={handleRoleUpdate}
              disabled={updateRoleMutation.isPending}
            >
              {updateRoleMutation.isPending ? 'Updating...' : 'Update Role'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
