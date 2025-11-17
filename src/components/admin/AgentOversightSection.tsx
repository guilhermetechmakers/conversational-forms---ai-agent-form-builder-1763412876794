import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AgentReportDialog } from "./AgentReportDialog";
import { adminApi } from "@/lib/api/admin";
import type { AdminAgent, AbuseReport } from "@/types/admin";
import { MessageSquare, Search, AlertTriangle, Eye } from "lucide-react";
import { toast } from "sonner";

export function AgentOversightSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<AbuseReport | null>(null);
  const queryClient = useQueryClient();

  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ['admin', 'agents'],
    queryFn: () => adminApi.getAgents(),
  });

  const { data: abuseReports, isLoading: reportsLoading } = useQuery({
    queryKey: ['admin', 'abuse-reports'],
    queryFn: () => adminApi.getAbuseReports(),
  });

  const updateReportMutation = useMutation({
    mutationFn: (data: { report_id: string; status: AbuseReport['status']; notes?: string }) =>
      adminApi.updateAbuseReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'abuse-reports'] });
      toast.success('Report updated successfully');
      setSelectedReport(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update report');
    },
  });

  const filteredAgents = agents?.filter((agent) => {
    const query = searchQuery.toLowerCase();
    return (
      agent.name.toLowerCase().includes(query) ||
      agent.slug.toLowerCase().includes(query) ||
      agent.owner?.email.toLowerCase().includes(query)
    );
  }) || [];

  const getStatusBadgeVariant = (status: AdminAgent['status']) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getReportStatusBadgeVariant = (status: AbuseReport['status']) => {
    switch (status) {
      case 'pending':
        return 'destructive';
      case 'reviewed':
        return 'secondary';
      case 'resolved':
        return 'default';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">Agent Oversight</h2>
      </div>

      {/* Abuse Reports Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{abuseReports?.length || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {abuseReports?.filter((r) => r.status === 'pending').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Requires review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <AlertTriangle className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {abuseReports?.filter((r) => r.status === 'resolved').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Agents</CardTitle>
          <CardDescription>Find agents by name, slug, or owner</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Agents Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Agents</CardTitle>
          <CardDescription>
            {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agentsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredAgents.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sessions</TableHead>
                    <TableHead>Abuse Reports</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgents.map((agent) => (
                    <TableRow key={agent.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-sm text-muted-foreground">{agent.slug}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{agent.owner?.email || 'Unknown'}</div>
                        {agent.owner?.full_name && (
                          <div className="text-xs text-muted-foreground">
                            {agent.owner.full_name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(agent.status)}>
                          {agent.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{agent.session_count}</TableCell>
                      <TableCell>
                        {agent.abuse_reports_count > 0 ? (
                          <Badge variant="destructive">{agent.abuse_reports_count}</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const reports = abuseReports?.filter((r) => r.agent_id === agent.id);
                            if (reports && reports.length > 0) {
                              setSelectedReport(reports[0]);
                            }
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No agents found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try adjusting your search query' : 'No agents in the system'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Abuse Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Abuse Reports</CardTitle>
          <CardDescription>
            Review and manage abuse reports for agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reportsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : abuseReports && abuseReports.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent ID</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {abuseReports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-mono text-sm">{report.agent_id.slice(0, 8)}...</TableCell>
                      <TableCell>{report.reason}</TableCell>
                      <TableCell>{report.reporter_email || 'Anonymous'}</TableCell>
                      <TableCell>
                        <Badge variant={getReportStatusBadgeVariant(report.status)}>
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(report.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedReport(report)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No abuse reports
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Dialog */}
      {selectedReport && (
        <AgentReportDialog
          report={selectedReport}
          open={!!selectedReport}
          onOpenChange={(open) => !open && setSelectedReport(null)}
          onUpdate={(data) => updateReportMutation.mutate(data)}
        />
      )}
    </div>
  );
}
