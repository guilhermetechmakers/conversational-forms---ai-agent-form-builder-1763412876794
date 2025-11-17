import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, RotateCcw } from "lucide-react";
import { useAgentVersions, useRestoreAgentVersion } from "@/hooks/useAgent";
import { format } from "date-fns";

interface VersionHistoryProps {
  agentId: string;
}

export function VersionHistory({ agentId }: VersionHistoryProps) {
  const { data: versions, isLoading } = useAgentVersions(agentId);
  const restoreVersion = useRestoreAgentVersion();

  const handleRestore = (versionId: string) => {
    if (confirm("Are you sure you want to restore this version? This will replace the current agent configuration.")) {
      restoreVersion.mutate({ agentId, versionId });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-full rounded border bg-card animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!versions || versions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Version History
          </CardTitle>
          <CardDescription>
            View and restore previous versions of this agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No version history available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-4 w-4" />
          Version History
        </CardTitle>
        <CardDescription>
          {versions.length} version(s) available
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {versions.map((version) => (
              <div
                key={version.id}
                className="p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">v{version.version}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(version.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(version.id)}
                    disabled={restoreVersion.isPending}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Restore
                  </Button>
                </div>
                {version.change_log && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {version.change_log}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
