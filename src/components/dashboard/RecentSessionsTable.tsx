import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, MoreVertical, Download, Send } from "lucide-react";
import { format } from "date-fns";
import type { Session } from "@/types/session";
import { toast } from "sonner";

interface RecentSessionsTableProps {
  sessions: Session[];
  isLoading?: boolean;
  onExport?: (sessionId: string, format: "csv" | "json") => void;
  onResendWebhook?: (sessionId: string) => void;
}

export function RecentSessionsTable({
  sessions,
  isLoading = false,
  onExport,
  onResendWebhook,
}: RecentSessionsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No sessions yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Sessions will appear here once visitors start interacting with your agents
        </p>
      </div>
    );
  }

  const handleExport = (sessionId: string, format: "csv" | "json") => {
    if (onExport) {
      onExport(sessionId, format);
      toast.success(`Exporting session as ${format.toUpperCase()}`);
    }
  };

  const handleResendWebhook = (sessionId: string) => {
    if (onResendWebhook) {
      onResendWebhook(sessionId);
      toast.success("Resending webhook...");
    }
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Session ID</TableHead>
            <TableHead>Agent</TableHead>
            <TableHead>Visitor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow
              key={session.id}
              className="hover:bg-muted/50 transition-colors"
            >
              <TableCell className="font-mono text-sm">
                <Link
                  to={`/sessions/${session.id}`}
                  className="hover:text-primary transition-colors"
                >
                  {session.id.slice(0, 8)}...
                </Link>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {session.agent_id.slice(0, 8)}...
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {session.metadata.utm_source || "Direct"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm">
                    {session.metadata.referrer
                      ? new URL(session.metadata.referrer).hostname
                      : "Direct"}
                  </span>
                  {session.metadata.utm_campaign && (
                    <span className="text-xs text-muted-foreground">
                      {session.metadata.utm_campaign}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    session.status === "completed"
                      ? "default"
                      : session.status === "in_progress"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {session.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(session.created_at), "MMM d, yyyy HH:mm")}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link
                        to={`/sessions/${session.id}`}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleExport(session.id, "csv")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExport(session.id, "json")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export JSON
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleResendWebhook(session.id)}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Resend Webhook
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
