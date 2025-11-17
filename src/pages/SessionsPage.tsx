import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, Search } from "lucide-react";
import { SessionSearchForm } from "@/components/session/SessionSearchForm";
import { SessionListTable } from "@/components/session/SessionListTable";
import { ExportConfigDialog } from "@/components/session/ExportConfigDialog";
import { useSessionSearch } from "@/hooks/useSessionSearch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionApi } from "@/lib/api/session";
import { toast } from "sonner";
import type { SessionSearchParams } from "@/types/session";

export function SessionsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useState<SessionSearchParams>({
    page: 1,
    limit: 20,
    sort_by: "created_at",
    sort_order: "desc",
  });
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const { data: searchResponse, isLoading } = useSessionSearch(searchParams);

  const exportMutation = useMutation({
    mutationFn: async (data: { sessionId: string; format: "csv" | "json" }) => {
      const blob = await sessionApi.export(data.sessionId, data.format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `session-${data.sessionId}-${data.format}.${data.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast.success("Export downloaded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export session");
    },
  });

  const resendWebhookMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return sessionApi.resendWebhook(sessionId);
    },
    onSuccess: () => {
      toast.success("Webhook resent successfully");
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to resend webhook");
    },
  });

  const handleSearch = (params: SessionSearchParams) => {
    setSearchParams(params);
    setSelectedSessions([]);
  };

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessions((prev) =>
      prev.includes(sessionId)
        ? prev.filter((id) => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const handleSelectAll = () => {
    if (searchResponse?.sessions) {
      if (selectedSessions.length === searchResponse.sessions.length) {
        setSelectedSessions([]);
      } else {
        setSelectedSessions(searchResponse.sessions.map((s) => s.id));
      }
    }
  };

  const handleExport = (sessionId: string, format: "csv" | "json") => {
    exportMutation.mutate({ sessionId, format });
  };

  const handleResendWebhook = (sessionId: string) => {
    resendWebhookMutation.mutate(sessionId);
  };

  const handleViewDetails = (sessionId: string) => {
    navigate(`/sessions/${sessionId}`);
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page }));
  };

  const handleBulkExport = () => {
    if (selectedSessions.length === 0) {
      toast.error("Please select at least one session to export");
      return;
    }
    setExportDialogOpen(true);
  };

  const sessions = searchResponse?.sessions || [];
  const totalPages = searchResponse?.total_pages || 1;
  const currentPage = searchResponse?.page || 1;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Sessions</h1>
            <p className="text-muted-foreground mt-1">
              Search, filter, and export your session data
            </p>
          </div>
          {selectedSessions.length > 0 && (
            <Button onClick={handleBulkExport}>
              <Download className="h-4 w-4 mr-2" />
              Export Selected ({selectedSessions.length})
            </Button>
          )}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="search" className="space-y-4">
          <TabsList>
            <TabsTrigger value="search">
              <Search className="h-4 w-4 mr-2" />
              Search & Filter
            </TabsTrigger>
            <TabsTrigger value="export">
              <FileText className="h-4 w-4 mr-2" />
              Export Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            {/* Search Form */}
            <SessionSearchForm
              onSearch={handleSearch}
              initialParams={searchParams}
            />

            {/* Session List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      Sessions
                      {searchResponse && (
                        <span className="text-muted-foreground font-normal ml-2">
                          ({searchResponse.total} total)
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      View and manage all your session data
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <SessionListTable
                  sessions={sessions}
                  isLoading={isLoading}
                  selectedSessions={selectedSessions}
                  onSelectSession={handleSelectSession}
                  onSelectAll={handleSelectAll}
                  onExport={handleExport}
                  onResendWebhook={handleResendWebhook}
                  onViewDetails={handleViewDetails}
                  page={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Export Logs</CardTitle>
                <CardDescription>
                  View history of scheduled and manual exports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Export logs will appear here once you create scheduled exports
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Export Dialog */}
        <ExportConfigDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          sessionIds={selectedSessions}
          onSuccess={() => {
            setSelectedSessions([]);
          }}
        />
      </div>
    </DashboardLayout>
  );
}
