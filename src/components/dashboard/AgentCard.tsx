import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageSquare, MoreVertical, Edit, Copy, ExternalLink, Trash2, Eye } from "lucide-react";
import type { Agent } from "@/types/agent";
import { toast } from "sonner";

interface AgentCardProps {
  agent: Agent;
  onClone?: (agentId: string) => void;
  onDisable?: (agentId: string) => void;
  sessionsCount?: number;
}

export function AgentCard({ agent, onClone, onDisable, sessionsCount = 0 }: AgentCardProps) {
  const agentUrl = `/a/${agent.workspace_id}/${agent.slug}`;
  const publicUrl = `${window.location.origin}${agentUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success("Link copied to clipboard");
  };

  const handleClone = () => {
    if (onClone) {
      onClone(agent.id);
      toast.success("Agent cloned successfully");
    }
  };

  const handleDisable = () => {
    if (onDisable) {
      onDisable(agent.id);
      toast.success("Agent disabled");
    }
  };

  return (
    <div className="group relative rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-muted/30">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-base truncate">{agent.name}</h3>
              <Badge
                variant={agent.status === "published" ? "default" : "secondary"}
                className="shrink-0"
              >
                {agent.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate mb-2">
              {agent.slug}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {sessionsCount} sessions
              </span>
              <span className="text-muted-foreground/60">
                {new Date(agent.updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link to={`/agents/${agent.id}/edit`} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/sessions?agent=${agent.id}`} className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                View Sessions
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyLink}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Copy Link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleClone}>
              <Copy className="h-4 w-4 mr-2" />
              Clone
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDisable}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Disable
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="flex-1"
        >
          <ExternalLink className="h-3 w-3 mr-2" />
          View Link
        </Button>
        <Button
          variant="default"
          size="sm"
          asChild
          className="flex-1"
        >
          <Link to={`/agents/${agent.id}/edit`}>
            <Edit className="h-3 w-3 mr-2" />
            Edit
          </Link>
        </Button>
      </div>
    </div>
  );
}
