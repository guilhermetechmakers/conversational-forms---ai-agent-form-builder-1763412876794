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
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, MoreVertical, Download, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import type { SessionWithDetails } from "@/types/session";

interface SessionListTableProps {
  sessions: SessionWithDetails[];
  isLoading?: boolean;
  selectedSessions: string[];
  onSelectSession: (sessionId: string) => void;
  onSelectAll: () => void;
  onExport?: (sessionId: string, format: "csv" | "json") => void;
  onResendWebhook?: (sessionId: string) => void;
  onViewDetails?: (sessionId: string) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function SessionListTable({
  sessions,
  isLoading = false,
  selectedSessions,
  onSelectSession,
  onSelectAll,
  onExport,
  onResendWebhook,
  onViewDetails,
  page = 1,
  totalPages = 1,
  onPageChange,
}: SessionListTableProps) {
  const allSelected = sessions.length > 0 && selectedSessions.length === sessions.length;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No sessions found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  const handleExport = (sessionId: string, format: "csv" | "json") => {
    if (onExport) {
      onExport(sessionId, format);
    }
  };

  const handleResendWebhook = (sessionId: string) => {
    if (onResendWebhook) {
      onResendWebhook(sessionId);
    }
  };

  const handleViewDetails = (sessionId: string) => {
    if (onViewDetails) {
      onViewDetails(sessionId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={onSelectAll}
                  aria-label="Select all sessions"
                />
              </TableHead>
              <TableHead>Session ID</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Fields Collected</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => {
              const isSelected = selectedSessions.includes(session.id);
              return (
                <TableRow
                  key={session.id}
                  className={`hover:bg-muted/50 transition-colors ${
                    isSelected ? "bg-muted/30" : ""
                  }`}
                >
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onSelectSession(session.id)}
                      aria-label={`Select session ${session.id}`}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    <Link
                      to={`/sessions/${session.id}`}
                      className="hover:text-primary transition-colors"
                      onClick={() => handleViewDetails(session.id)}
                    >
                      {session.id.slice(0, 8)}...
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {session.agent?.name || "Unknown Agent"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {session.agent?.slug || session.agent_id.slice(0, 8)}
                      </span>
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
                      {session.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {session.parsed_fields.length} / {session.parsed_fields.filter(f => f.validated).length}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {session.metadata.utm_source || "Direct"}
                      </span>
                      {session.metadata.utm_campaign && (
                        <span className="text-xs text-muted-foreground">
                          {session.metadata.utm_campaign}
                        </span>
                      )}
                    </div>
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
                            onClick={() => handleViewDetails(session.id)}
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
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
