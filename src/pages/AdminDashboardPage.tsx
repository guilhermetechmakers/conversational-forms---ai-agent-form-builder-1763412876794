import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagementSection } from "@/components/admin/UserManagementSection";
import { AgentOversightSection } from "@/components/admin/AgentOversightSection";
import { SystemMetricsSection } from "@/components/admin/SystemMetricsSection";
import { AuditLogsSection } from "@/components/admin/AuditLogsSection";
import { AdminCriticalAlerts } from "@/components/notifications/AdminCriticalAlerts";

export function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage users, agents, and monitor system performance
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-3xl grid-cols-5">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="agents">Agent Oversight</TabsTrigger>
            <TabsTrigger value="metrics">System Metrics</TabsTrigger>
            <TabsTrigger value="alerts">Critical Alerts</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <UserManagementSection />
          </TabsContent>

          <TabsContent value="agents" className="mt-6">
            <AgentOversightSection />
          </TabsContent>

          <TabsContent value="metrics" className="mt-6">
            <SystemMetricsSection />
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <AdminCriticalAlerts />
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            <AuditLogsSection />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
