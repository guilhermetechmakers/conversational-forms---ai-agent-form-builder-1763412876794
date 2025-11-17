import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Copy,
  ExternalLink,
  Trash2,
  Eye,
  Filter,
} from "lucide-react";
import { useAgents } from "@/hooks/useAgent";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { Agent } from "@/types/agent";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export function AgentListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: agents, isLoading } = useAgents();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());

  const cloneAgentMutation = useMutation({
    mutationFn: async (agentId: string) => {
      return api.post<Agent>(`/agents/${agentId}/clone`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success("Agent cloned successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to clone agent");
    },
  });

  const deleteAgentMutation = useMutation({
    mutationFn: async (agentId: string) => {
      return api.delete(`/agents/${agentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success("Agent deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete agent");
    },
  });

  const archiveAgentMutation = useMutation({
    mutationFn: async (agentId: string) => {
      return api.patch(`/agents/${agentId}`, { status: "archived" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success("Agent archived successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to archive agent");
    },
  });

  const handleClone = (agentId: string) => {
    cloneAgentMutation.mutate(agentId);
  };

  const handleDelete = (agentId: string) => {
    if (confirm("Are you sure you want to delete this agent? This action cannot be undone.")) {
      deleteAgentMutation.mutate(agentId);
    }
  };

  const handleArchive = (agentId: string) => {
    archiveAgentMutation.mutate(agentId);
  };

  const handleCopyLink = (agent: Agent) => {
    const agentUrl = `/a/${agent.workspace_id}/${agent.slug}`;
    const publicUrl = `${window.location.origin}${agentUrl}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success("Link copied to clipboard");
  };

  const handleBulkDelete = () => {
    if (selectedAgents.size === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedAgents.size} agent(s)? This action cannot be undone.`)) {
      Promise.all(Array.from(selectedAgents).map(id => api.delete(`/agents/${id}`)))
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["agents"] });
          setSelectedAgents(new Set());
          toast.success(`${selectedAgents.size} agent(s) deleted successfully`);
        })
        .catch((error) => {
          toast.error(error.message || "Failed to delete agents");
        });
    }
  };

  const handleBulkArchive = () => {
    if (selectedAgents.size === 0) return;
    Promise.all(Array.from(selectedAgents).map(id => api.patch(`/agents/${id}`, { status: "archived" })))
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["agents"] });
        setSelectedAgents(new Set());
        toast.success(`${selectedAgents.size} agent(s) archived successfully`);
      })
      .catch((error) => {
        toast.error(error.message || "Failed to archive agents");
      });
  };

  const toggleSelectAgent = (agentId: string) => {
    const newSelected = new Set(selectedAgents);
    if (newSelected.has(agentId)) {
      newSelected.delete(agentId);
    } else {
      newSelected.add(agentId);
    }
    setSelectedAgents(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedAgents.size === filteredAgents.length) {
      setSelectedAgents(new Set());
    } else {
      setSelectedAgents(new Set(filteredAgents.map(a => a.id)));
    }
  };

  const filteredAgents = (agents || []).filter((agent) => {
    const matchesSearch = 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || agent.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Agent Management</h1>
            <p className="text-muted-foreground mt-1">
              Create, manage, and monitor your conversational form agents
            </p>
          </div>
          <Link to="/agents/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Agent
            </Button>
          </Link>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search agents by name or slug..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedAgents.size > 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {selectedAgents.size} agent(s) selected
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkArchive}
                  >
                    Archive Selected
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Agents Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Agents</CardTitle>
                <CardDescription>
                  {filteredAgents.length} agent(s) found
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 w-full rounded-lg border bg-card animate-pulse" />
                ))}
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== "all"
                    ? "No agents match your filters"
                    : "No agents yet"}
                </p>
                {!searchQuery && statusFilter === "all" && (
                  <Link to="/agents/new">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Agent
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedAgents.size === filteredAgents.length && filteredAgents.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-border"
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Fields</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAgents.map((agent) => (
                      <TableRow
                        key={agent.id}
                        className={cn(
                          "cursor-pointer hover:bg-muted/50 transition-colors",
                          selectedAgents.has(agent.id) && "bg-primary/5"
                        )}
                        onClick={() => navigate(`/agents/${agent.id}/edit`)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedAgents.has(agent.id)}
                            onChange={() => toggleSelectAgent(agent.id)}
                            className="rounded border-border"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{agent.name}</div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {agent.slug}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              agent.status === "published"
                                ? "default"
                                : agent.status === "draft"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {agent.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {agent.fields?.length || 0} field(s)
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(agent.updated_at), "MMM d, yyyy")}
                          </span>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem asChild>
                                <Link to={`/agents/${agent.id}/edit`}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/sessions?agent=${agent.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Sessions
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCopyLink(agent)}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Copy Link
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleClone(agent.id)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Clone
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {agent.status !== "archived" && (
                                <DropdownMenuItem onClick={() => handleArchive(agent.id)}>
                                  Archive
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDelete(agent.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
