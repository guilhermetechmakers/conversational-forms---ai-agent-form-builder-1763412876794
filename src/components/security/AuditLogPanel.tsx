import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ClipboardList, 
  Search, 
  Filter,
  Calendar,
  User,
  AlertCircle,
  Info,
  Eye
} from "lucide-react";
import { securityApi } from "@/lib/api/security";
import type { SecurityAuditLog, SecurityAuditActionType } from "@/types/security";
import { format } from "date-fns";

export function AuditLogPanel() {
  const [selectedLog, setSelectedLog] = useState<SecurityAuditLog | null>(null);
  const [filters, setFilters] = useState({
    actionType: "" as SecurityAuditActionType | "",
    severity: "" as "low" | "medium" | "high" | "critical" | "",
    search: "",
    startDate: "",
    endDate: "",
  });

  const { data: logs, isLoading } = useQuery({
    queryKey: ["security", "audit-logs", filters],
    queryFn: () => securityApi.getAuditLogs({
      ...(filters.actionType && { actionType: filters.actionType }),
      ...(filters.severity && { severity: filters.severity }),
      ...(filters.search && { search: filters.search }),
      ...(filters.startDate && { startDate: filters.startDate }),
      ...(filters.endDate && { endDate: filters.endDate }),
    }),
  });

  const getSeverityBadge = (severity: SecurityAuditLog["severity"]) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      low: "secondary",
      medium: "default",
      high: "destructive",
      critical: "destructive",
    };

    const colors: Record<string, string> = {
      low: "text-muted-foreground",
      medium: "text-primary",
      high: "text-orange-500",
      critical: "text-destructive",
    };

    return (
      <Badge variant={variants[severity] || "secondary"} className={colors[severity]}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  const formatActionType = (actionType: SecurityAuditActionType) => {
    return actionType
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const clearFilters = () => {
    setFilters({
      actionType: "",
      severity: "",
      search: "",
      startDate: "",
      endDate: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Audit Logs
          </CardTitle>
          <CardDescription>
            Search and filter audit logs by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search logs..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="actionType">Action Type</Label>
              <Select
                value={filters.actionType}
                onValueChange={(value) => setFilters({ ...filters, actionType: value as SecurityAuditActionType | "" })}
              >
                <SelectTrigger id="actionType">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All actions</SelectItem>
                  <SelectItem value="api_key_rotated">API Key Rotated</SelectItem>
                  <SelectItem value="password_changed">Password Changed</SelectItem>
                  <SelectItem value="two_factor_enabled">2FA Enabled</SelectItem>
                  <SelectItem value="two_factor_disabled">2FA Disabled</SelectItem>
                  <SelectItem value="login_success">Login Success</SelectItem>
                  <SelectItem value="login_failed">Login Failed</SelectItem>
                  <SelectItem value="data_exported">Data Exported</SelectItem>
                  <SelectItem value="data_deleted">Data Deleted</SelectItem>
                  <SelectItem value="pii_redacted">PII Redacted</SelectItem>
                  <SelectItem value="pii_hashed">PII Hashed</SelectItem>
                  <SelectItem value="permission_granted">Permission Granted</SelectItem>
                  <SelectItem value="permission_revoked">Permission Revoked</SelectItem>
                  <SelectItem value="agent_published">Agent Published</SelectItem>
                  <SelectItem value="agent_deleted">Agent Deleted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select
                value={filters.severity}
                onValueChange={(value) => setFilters({ ...filters, severity: value as typeof filters.severity })}
              >
                <SelectTrigger id="severity">
                  <SelectValue placeholder="All severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All severities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Audit Logs
          </CardTitle>
          <CardDescription>
            Complete history of security-related actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : logs && logs.length > 0 ? (
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      log.severity === "critical" || log.severity === "high"
                        ? "bg-destructive/10"
                        : log.severity === "medium"
                        ? "bg-primary/10"
                        : "bg-muted"
                    }`}>
                      {log.severity === "critical" || log.severity === "high" ? (
                        <AlertCircle className={`h-5 w-5 ${
                          log.severity === "critical" ? "text-destructive" : "text-orange-500"
                        }`} />
                      ) : (
                        <Info className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{formatActionType(log.actionType)}</h3>
                        {getSeverityBadge(log.severity)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.userEmail}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(log.timestamp), "PPp")}
                        </span>
                        {log.resourceType && (
                          <span className="text-xs bg-muted px-2 py-0.5 rounded">
                            {log.resourceType}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedLog(log)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No audit logs found</h3>
              <p className="text-muted-foreground">
                {Object.values(filters).some(v => v) 
                  ? "Try adjusting your filters"
                  : "Audit logs will appear here as actions are performed"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedLog && formatActionType(selectedLog.actionType)}</DialogTitle>
            <DialogDescription>
              Detailed information about this audit log entry
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Severity</Label>
                  <div className="mt-1">{getSeverityBadge(selectedLog.severity)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Timestamp</Label>
                  <p className="mt-1 text-sm">{format(new Date(selectedLog.timestamp), "PPpp")}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">User</Label>
                  <p className="mt-1 text-sm">{selectedLog.userEmail}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">User ID</Label>
                  <p className="mt-1 text-sm font-mono text-xs">{selectedLog.userId}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Resource Type</Label>
                  <p className="mt-1 text-sm">{selectedLog.resourceType || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Resource ID</Label>
                  <p className="mt-1 text-sm font-mono text-xs">{selectedLog.resourceId || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">IP Address</Label>
                  <p className="mt-1 text-sm font-mono text-xs">{selectedLog.ipAddress}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">User Agent</Label>
                  <p className="mt-1 text-sm text-xs line-clamp-2">{selectedLog.userAgent}</p>
                </div>
              </div>
              {Object.keys(selectedLog.details).length > 0 && (
                <>
                  <div>
                    <Label className="text-xs text-muted-foreground">Details</Label>
                    <pre className="mt-2 p-3 bg-muted rounded-lg text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
