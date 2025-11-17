import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Hash,
  AlertTriangle,
  CheckCircle2,
  Shield
} from "lucide-react";
import { securityApi } from "@/lib/api/security";
import type { PIIManagementSettings, PIIField } from "@/types/security";
import { toast } from "sonner";

export function PIIManagement() {
  const queryClient = useQueryClient();
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const { data: status } = useQuery({
    queryKey: ["security", "pii", "status"],
    queryFn: () => securityApi.getPIIStatus(),
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["security", "pii", "settings"],
    queryFn: () => securityApi.getPIIManagementSettings(),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (updates: Partial<PIIManagementSettings>) => 
      securityApi.updatePIIManagementSettings(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "pii", "settings"] });
      queryClient.invalidateQueries({ queryKey: ["security", "pii", "status"] });
      toast.success("PII management settings updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update PII management settings");
    },
  });

  const redactPIIMutation = useMutation({
    mutationFn: (fieldNames: string[]) => securityApi.redactPII(fieldNames),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["security", "pii", "status"] });
      queryClient.invalidateQueries({ queryKey: ["security", "pii", "settings"] });
      toast.success(`Successfully redacted ${data.redactedFields.length} field(s)`);
      setSelectedFields([]);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to redact PII");
    },
  });

  const hashPIIMutation = useMutation({
    mutationFn: (fieldNames: string[]) => securityApi.hashPII(fieldNames),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["security", "pii", "status"] });
      queryClient.invalidateQueries({ queryKey: ["security", "pii", "settings"] });
      toast.success(`Successfully hashed ${data.hashedFields.length} field(s)`);
      setSelectedFields([]);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to hash PII");
    },
  });

  const handleToggle = (field: keyof PIIManagementSettings, value: boolean) => {
    if (!settings) return;
    updateSettingsMutation.mutate({ [field]: value });
  };

  const handleUpdate = (updates: Partial<PIIManagementSettings>) => {
    updateSettingsMutation.mutate(updates);
  };

  const toggleFieldSelection = (fieldName: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldName)
        ? prev.filter(f => f !== fieldName)
        : [...prev, fieldName]
    );
  };

  const getFieldTypeBadge = (fieldType: PIIField["fieldType"]) => {
    const colors: Record<string, string> = {
      email: "bg-blue-100 text-blue-800",
      phone: "bg-green-100 text-green-800",
      ssn: "bg-red-100 text-red-800",
      credit_card: "bg-purple-100 text-purple-800",
      address: "bg-orange-100 text-orange-800",
      name: "bg-indigo-100 text-indigo-800",
      other: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge className={colors[fieldType] || colors.other}>
        {fieldType.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  if (isLoading || !settings) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PII Detection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            PII Detection Status
          </CardTitle>
          <CardDescription>
            Overview of detected personally identifiable information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    status.detected ? "bg-orange-100" : "bg-accent/10"
                  }`}>
                    {status.detected ? (
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-accent" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {status.detected ? "PII Detected" : "No PII Detected"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {status.fields.length} field(s) scanned
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {status.redactionEnabled && (
                    <Badge variant="default" className="bg-accent">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Redaction Enabled
                    </Badge>
                  )}
                  {status.hashingEnabled && (
                    <Badge variant="default" className="bg-primary">
                      <Hash className="h-3 w-3 mr-1" />
                      Hashing Enabled
                    </Badge>
                  )}
                </div>
              </div>
              {status.fields.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Detected Fields</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {status.fields.map((field) => (
                        <div
                          key={field.fieldName}
                          className="flex items-center justify-between p-2 border rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{field.fieldName}</span>
                            {getFieldTypeBadge(field.fieldType)}
                          </div>
                          <div className="flex items-center gap-2">
                            {field.redacted && (
                              <Badge variant="secondary" className="text-xs">
                                <EyeOff className="h-3 w-3 mr-1" />
                                Redacted
                              </Badge>
                            )}
                            {field.hashed && (
                              <Badge variant="secondary" className="text-xs">
                                <Hash className="h-3 w-3 mr-1" />
                                Hashed
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Loading PII status...</p>
          )}
        </CardContent>
      </Card>

      {/* PII Management Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            PII Management Settings
          </CardTitle>
          <CardDescription>
            Configure automatic PII detection and protection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto Detection */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoDetect" className="text-base">Automatic PII Detection</Label>
              <p className="text-sm text-muted-foreground">
                Automatically scan and detect PII in your data
              </p>
            </div>
            <Switch
              id="autoDetect"
              checked={settings.autoDetect}
              onCheckedChange={(checked) => handleToggle("autoDetect", checked)}
              disabled={updateSettingsMutation.isPending}
            />
          </div>

          <Separator />

          {/* Auto Redaction */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoRedact" className="text-base">Automatic Redaction</Label>
              <p className="text-sm text-muted-foreground">
                Automatically redact detected PII
              </p>
            </div>
            <Switch
              id="autoRedact"
              checked={settings.autoRedact}
              onCheckedChange={(checked) => handleToggle("autoRedact", checked)}
              disabled={updateSettingsMutation.isPending || !settings.autoDetect}
            />
          </div>

          <Separator />

          {/* Auto Hashing */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoHash" className="text-base">Automatic Hashing</Label>
              <p className="text-sm text-muted-foreground">
                Automatically hash detected PII for secure storage
              </p>
            </div>
            <Switch
              id="autoHash"
              checked={settings.autoHash}
              onCheckedChange={(checked) => handleToggle("autoHash", checked)}
              disabled={updateSettingsMutation.isPending || !settings.autoDetect}
            />
          </div>

          <Separator />

          {/* Redaction Method */}
          <div className="space-y-2">
            <Label htmlFor="redactionMethod">Redaction Method</Label>
            <Select
              value={settings.redactionMethod}
              onValueChange={(value) => 
                handleUpdate({ redactionMethod: value as PIIManagementSettings["redactionMethod"] })
              }
              disabled={updateSettingsMutation.isPending}
            >
              <SelectTrigger id="redactionMethod">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mask">Mask (e.g., ***@***.com)</SelectItem>
                <SelectItem value="remove">Remove (completely remove)</SelectItem>
                <SelectItem value="replace">Replace (with placeholder)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              How PII should be redacted when detected
            </p>
          </div>

          <Separator />

          {/* Hashing Algorithm */}
          <div className="space-y-2">
            <Label htmlFor="hashingAlgorithm">Hashing Algorithm</Label>
            <Select
              value={settings.hashingAlgorithm}
              onValueChange={(value) => 
                handleUpdate({ hashingAlgorithm: value as PIIManagementSettings["hashingAlgorithm"] })
              }
              disabled={updateSettingsMutation.isPending}
            >
              <SelectTrigger id="hashingAlgorithm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sha256">SHA-256 (Recommended)</SelectItem>
                <SelectItem value="sha512">SHA-512 (More secure)</SelectItem>
                <SelectItem value="bcrypt">BCrypt (For passwords)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Algorithm used for hashing PII data
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Manual PII Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Manual PII Management
          </CardTitle>
          <CardDescription>
            Manually redact or hash specific PII fields
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.fields.length > 0 ? (
            <>
              <div className="space-y-2">
                <Label>Select Fields to Process</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto p-2 border rounded-lg">
                  {settings.fields.map((field) => (
                    <div
                      key={field.fieldName}
                      className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded cursor-pointer"
                      onClick={() => toggleFieldSelection(field.fieldName)}
                    >
                      <Checkbox
                        checked={selectedFields.includes(field.fieldName)}
                        onCheckedChange={() => toggleFieldSelection(field.fieldName)}
                      />
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm font-medium">{field.fieldName}</span>
                        {getFieldTypeBadge(field.fieldType)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => redactPIIMutation.mutate(selectedFields)}
                  disabled={selectedFields.length === 0 || redactPIIMutation.isPending}
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  Redact Selected
                </Button>
                <Button
                  variant="outline"
                  onClick={() => hashPIIMutation.mutate(selectedFields)}
                  disabled={selectedFields.length === 0 || hashPIIMutation.isPending}
                >
                  <Hash className="h-4 w-4 mr-2" />
                  Hash Selected
                </Button>
                {selectedFields.length > 0 && (
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedFields([])}
                  >
                    Clear Selection
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No PII fields available for management</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
