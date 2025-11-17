import { useState } from "react";
import { format } from "date-fns";
import { 
  RotateCcw, 
  Trash2, 
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Session } from "@/types/session";

interface SessionManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessions: Session[];
  onRestart: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onView: (sessionId: string) => void;
  isLoading?: boolean;
}

export function SessionManagementModal({
  open,
  onOpenChange,
  sessions,
  onRestart,
  onDelete,
  onView,
  isLoading = false,
}: SessionManagementModalProps) {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const getStatusBadge = (status: Session["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="gap-1 bg-accent/10 text-accent border-accent/20">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="gap-1 bg-primary/10 text-primary border-primary/20">
            <Clock className="h-3 w-3" />
            In Progress
          </Badge>
        );
      case "abandoned":
        return (
          <Badge variant="outline" className="gap-1 bg-muted text-muted-foreground">
            <AlertCircle className="h-3 w-3" />
            Abandoned
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleRestart = (sessionId: string) => {
    onRestart(sessionId);
    setSelectedSession(null);
  };

  const handleDelete = (sessionId: string) => {
    if (confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
      onDelete(sessionId);
      setSelectedSession(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Sessions</DialogTitle>
          <DialogDescription>
            Review and manage your active and incomplete sessions
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No sessions found</p>
          </div>
        ) : (
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-3 py-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all",
                    selectedSession === session.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-sm font-semibold truncate">
                          Session {session.id.slice(0, 8)}
                        </h4>
                        {getStatusBadge(session.status)}
                      </div>
                      
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p>
                          Started: {format(new Date(session.created_at), "MMM d, yyyy h:mm a")}
                        </p>
                        {session.completed_at && (
                          <p>
                            Completed: {format(new Date(session.completed_at), "MMM d, yyyy h:mm a")}
                          </p>
                        )}
                        <p>
                          Fields collected: {session.parsed_fields.length}
                        </p>
                        {session.metadata.utm_source && (
                          <p>
                            Source: {session.metadata.utm_source}
                            {session.metadata.utm_campaign && ` - ${session.metadata.utm_campaign}`}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(session.id)}
                        className="h-8"
                      >
                        <ExternalLink className="h-3 w-3 mr-1.5" />
                        View
                      </Button>
                      {session.status === "in_progress" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestart(session.id)}
                          className="h-8"
                        >
                          <RotateCcw className="h-3 w-3 mr-1.5" />
                          Restart
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(session.id)}
                        className="h-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {session.parsed_fields.length > 0 && (
                    <>
                      <Separator className="my-3" />
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Collected Fields:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {session.parsed_fields.slice(0, 5).map((field) => (
                            <Badge
                              key={field.field_id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {field.field_name}
                            </Badge>
                          ))}
                          {session.parsed_fields.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{session.parsed_fields.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
