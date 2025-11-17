import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Globe, Monitor, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";
import type { SessionWithDetails } from "@/types/session";

interface SessionHeaderProps {
  session: SessionWithDetails;
}

export function SessionHeader({ session }: SessionHeaderProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'abandoned':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="shadow-card">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Top Row: ID and Status */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-semibold">Session Details</h1>
                <Badge variant={getStatusVariant(session.status)} className="capitalize">
                  {session.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground font-mono">
                {session.id}
              </p>
            </div>
            {session.agent && (
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">Agent</div>
                <div className="font-semibold">{session.agent.name}</div>
                {session.agent.slug && (
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <LinkIcon className="h-3 w-3" />
                    {session.agent.slug}
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-xs text-muted-foreground mb-1">Created</div>
                <div className="text-sm font-medium">
                  {format(new Date(session.created_at), 'MMM d, yyyy HH:mm')}
                </div>
              </div>
            </div>
            
            {session.completed_at && (
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Completed</div>
                  <div className="text-sm font-medium">
                    {format(new Date(session.completed_at), 'MMM d, yyyy HH:mm')}
                  </div>
                </div>
              </div>
            )}

            {session.metadata.referrer && (
              <div className="flex items-start gap-3">
                <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Referrer</div>
                  <div className="text-sm font-medium truncate max-w-[200px]" title={session.metadata.referrer}>
                    {session.metadata.referrer}
                  </div>
                </div>
              </div>
            )}

            {session.metadata.ip && (
              <div className="flex items-start gap-3">
                <Monitor className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground mb-1">IP Address</div>
                  <div className="text-sm font-medium font-mono">
                    {session.metadata.ip}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* UTM Parameters */}
          {(session.metadata.utm_source || session.metadata.utm_campaign || session.metadata.utm_medium) && (
            <>
              <Separator />
              <div className="flex flex-wrap gap-4">
                {session.metadata.utm_source && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">UTM Source</div>
                    <Badge variant="outline">{session.metadata.utm_source}</Badge>
                  </div>
                )}
                {session.metadata.utm_medium && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">UTM Medium</div>
                    <Badge variant="outline">{session.metadata.utm_medium}</Badge>
                  </div>
                )}
                {session.metadata.utm_campaign && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">UTM Campaign</div>
                    <Badge variant="outline">{session.metadata.utm_campaign}</Badge>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
