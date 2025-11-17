import { useState } from "react";
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
  Shield, 
  Lock, 
  Key, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Users,
  Globe
} from "lucide-react";
import { securityApi } from "@/lib/api/security";
import type { SecuritySettings } from "@/types/security";
import { toast } from "sonner";
import { format } from "date-fns";

export function SecuritySettings() {
  const queryClient = useQueryClient();
  const [apiKeyRotating, setApiKeyRotating] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["security", "settings"],
    queryFn: () => securityApi.getSecuritySettings(),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (updates: Partial<SecuritySettings>) => securityApi.updateSecuritySettings(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "settings"] });
      toast.success("Security settings updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update security settings");
    },
  });

  const rotateApiKeyMutation = useMutation({
    mutationFn: () => securityApi.rotateApiKey(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["security", "settings"] });
      toast.success(`API key rotated successfully at ${format(new Date(data.rotatedAt), "PPp")}`);
      setApiKeyRotating(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to rotate API key");
      setApiKeyRotating(false);
    },
  });

  const handleRotateApiKey = () => {
    setApiKeyRotating(true);
    rotateApiKeyMutation.mutate();
  };

  const handleToggle = (field: keyof SecuritySettings, value: boolean) => {
    updateSettingsMutation.mutate({ [field]: value });
  };

  const handleUpdate = (updates: Partial<SecuritySettings>) => {
    updateSettingsMutation.mutate(updates);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Failed to load security settings</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encryption Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Encryption Status
          </CardTitle>
          <CardDescription>
            Data protection measures in place
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Encryption at Rest</p>
                <p className="text-sm text-muted-foreground">AES-256 encryption for stored data</p>
              </div>
            </div>
            {settings.encryptionAtRest ? (
              <Badge variant="default" className="bg-accent">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge variant="secondary">Inactive</Badge>
            )}
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Encryption in Transit</p>
                <p className="text-sm text-muted-foreground">TLS 1.3 for all data transmission</p>
              </div>
            </div>
            {settings.encryptionInTransit ? (
              <Badge variant="default" className="bg-accent">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge variant="secondary">Inactive</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Authentication & Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Authentication & Access Control
          </CardTitle>
          <CardDescription>
            Configure authentication and access policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="2fa" className="text-base">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              id="2fa"
              checked={settings.twoFactorEnabled}
              onCheckedChange={(checked) => handleToggle("twoFactorEnabled", checked)}
              disabled={updateSettingsMutation.isPending}
            />
          </div>

          <Separator />

          {/* Session Timeout */}
          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="sessionTimeout"
                type="number"
                min="5"
                max="1440"
                value={settings.sessionTimeoutMinutes}
                onChange={(e) => handleUpdate({ sessionTimeoutMinutes: parseInt(e.target.value) || 30 })}
                className="w-32"
                disabled={updateSettingsMutation.isPending}
              />
              <p className="text-sm text-muted-foreground">
                Automatically log out after inactivity
              </p>
            </div>
          </div>

          <Separator />

          {/* Role-Based Access */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="rba" className="text-base">Role-Based Access Control</Label>
              <p className="text-sm text-muted-foreground">
                Enforce permissions based on user roles
              </p>
            </div>
            <Switch
              id="rba"
              checked={settings.accessControl.roleBasedAccess}
              onCheckedChange={(checked) => 
                handleUpdate({ 
                  accessControl: { ...settings.accessControl, roleBasedAccess: checked }
                })
              }
              disabled={updateSettingsMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* API Key Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Key Management
          </CardTitle>
          <CardDescription>
            Manage API key rotation and security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Rotation Policy</p>
              <p className="text-sm text-muted-foreground">
                Rotate keys every {settings.apiKeyRotationDays} days
              </p>
            </div>
            <div className="text-right">
              {settings.lastApiKeyRotation ? (
                <p className="text-sm text-muted-foreground">
                  Last rotated: {format(new Date(settings.lastApiKeyRotation), "PPp")}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Never rotated</p>
              )}
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="rotationDays">Rotation Interval (days)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="rotationDays"
                type="number"
                min="1"
                max="365"
                value={settings.apiKeyRotationDays}
                onChange={(e) => handleUpdate({ apiKeyRotationDays: parseInt(e.target.value) || 90 })}
                className="w-32"
                disabled={updateSettingsMutation.isPending}
              />
              <Button
                onClick={handleRotateApiKey}
                disabled={apiKeyRotating || rotateApiKeyMutation.isPending}
                variant="outline"
              >
                {apiKeyRotating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Rotating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Rotate Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Password Policy
          </CardTitle>
          <CardDescription>
            Configure password requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="minLength">Minimum Length</Label>
            <Input
              id="minLength"
              type="number"
              min="8"
              max="128"
              value={settings.passwordPolicy.minLength}
              onChange={(e) => 
                handleUpdate({ 
                  passwordPolicy: { 
                    ...settings.passwordPolicy, 
                    minLength: parseInt(e.target.value) || 8 
                  }
                })
              }
              className="w-32"
              disabled={updateSettingsMutation.isPending}
            />
          </div>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="requireUppercase">Require Uppercase Letters</Label>
              <Switch
                id="requireUppercase"
                checked={settings.passwordPolicy.requireUppercase}
                onCheckedChange={(checked) => 
                  handleUpdate({ 
                    passwordPolicy: { ...settings.passwordPolicy, requireUppercase: checked }
                  })
                }
                disabled={updateSettingsMutation.isPending}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="requireLowercase">Require Lowercase Letters</Label>
              <Switch
                id="requireLowercase"
                checked={settings.passwordPolicy.requireLowercase}
                onCheckedChange={(checked) => 
                  handleUpdate({ 
                    passwordPolicy: { ...settings.passwordPolicy, requireLowercase: checked }
                  })
                }
                disabled={updateSettingsMutation.isPending}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="requireNumbers">Require Numbers</Label>
              <Switch
                id="requireNumbers"
                checked={settings.passwordPolicy.requireNumbers}
                onCheckedChange={(checked) => 
                  handleUpdate({ 
                    passwordPolicy: { ...settings.passwordPolicy, requireNumbers: checked }
                  })
                }
                disabled={updateSettingsMutation.isPending}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
              <Switch
                id="requireSpecialChars"
                checked={settings.passwordPolicy.requireSpecialChars}
                onCheckedChange={(checked) => 
                  handleUpdate({ 
                    passwordPolicy: { ...settings.passwordPolicy, requireSpecialChars: checked }
                  })
                }
                disabled={updateSettingsMutation.isPending}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IP Whitelist & Domain Restrictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Access Restrictions
          </CardTitle>
          <CardDescription>
            Configure IP whitelist and allowed domains
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>IP Whitelist</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Restrict access to specific IP addresses (one per line)
            </p>
            <textarea
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={settings.accessControl.ipWhitelist.join("\n")}
              onChange={(e) => 
                handleUpdate({ 
                  accessControl: { 
                    ...settings.accessControl, 
                    ipWhitelist: e.target.value.split("\n").filter(ip => ip.trim())
                  }
                })
              }
              placeholder="192.168.1.1&#10;10.0.0.1"
              disabled={updateSettingsMutation.isPending}
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Allowed Domains</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Restrict access to specific email domains (one per line)
            </p>
            <textarea
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={settings.accessControl.allowedDomains.join("\n")}
              onChange={(e) => 
                handleUpdate({ 
                  accessControl: { 
                    ...settings.accessControl, 
                    allowedDomains: e.target.value.split("\n").filter(domain => domain.trim())
                  }
                })
              }
              placeholder="example.com&#10;company.com"
              disabled={updateSettingsMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
