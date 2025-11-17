import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SecuritySettings } from "@/components/security/SecuritySettings";
import { ComplianceActions } from "@/components/security/ComplianceActions";
import { AuditLogPanel } from "@/components/security/AuditLogPanel";
import { PIIManagement } from "@/components/security/PIIManagement";
import { 
  Shield, 
  FileText, 
  ClipboardList, 
  Lock 
} from "lucide-react";

export function SecurityPrivacyCompliancePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Security, Privacy & Compliance</h1>
          <p className="text-muted-foreground mt-1">
            Manage security settings, data privacy, and compliance controls
          </p>
        </div>

        <Tabs defaultValue="security" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Audit Logs
            </TabsTrigger>
            <TabsTrigger value="pii" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              PII Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="security" className="space-y-6">
            <SecuritySettings />
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <ComplianceActions />
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <AuditLogPanel />
          </TabsContent>

          <TabsContent value="pii" className="space-y-6">
            <PIIManagement />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
