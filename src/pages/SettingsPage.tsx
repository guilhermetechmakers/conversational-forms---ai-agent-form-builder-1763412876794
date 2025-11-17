import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Building2, 
  CreditCard, 
  Key, 
  Users, 
  Shield, 
  Database,
  ArrowLeft
} from "lucide-react";
import { AccountInfoSection } from "@/components/settings/AccountInfoSection";
import { WorkspaceSettingsSection } from "@/components/settings/WorkspaceSettingsSection";
import { ApiKeysSection } from "@/components/settings/ApiKeysSection";
import { TeamManagementSection } from "@/components/settings/TeamManagementSection";
import { SecuritySection } from "@/components/settings/SecuritySection";
import { DataPrivacySection } from "@/components/settings/DataPrivacySection";

export function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-semibold">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account, workspace, and preferences
            </p>
          </div>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="workspace" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Workspace</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <span className="hidden sm:inline">API Keys</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Team</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <AccountInfoSection />
          </TabsContent>

          <TabsContent value="workspace" className="space-y-6">
            <WorkspaceSettingsSection />
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Plan</CardTitle>
                <CardDescription>
                  Manage your subscription, usage, and payment methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  For detailed billing management, usage tracking, invoices, and payment methods, 
                  visit the dedicated billing page.
                </p>
                <Link to="/billing">
                  <Button className="btn-hover">
                    Go to Billing & Plans
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api-keys" className="space-y-6">
            <ApiKeysSection />
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <TeamManagementSection />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecuritySection />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <DataPrivacySection />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
