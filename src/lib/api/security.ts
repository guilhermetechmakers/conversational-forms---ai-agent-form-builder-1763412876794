import { api } from "../api";
import type {
  SecuritySettings,
  SecurityAuditLog,
  SecurityAuditLogFilters,
  ComplianceRequest,
  DataExportRequest,
  DataDeletionRequest,
  PIIStatus,
  PIIManagementSettings,
  ConsentLog,
} from "@/types/security";

export const securityApi = {
  // Security Settings
  getSecuritySettings: async (): Promise<SecuritySettings> => {
    return api.get<SecuritySettings>("/security/settings");
  },

  updateSecuritySettings: async (settings: Partial<SecuritySettings>): Promise<SecuritySettings> => {
    return api.put<SecuritySettings>("/security/settings", settings);
  },

  rotateApiKey: async (): Promise<{ message: string; rotatedAt: string }> => {
    return api.post<{ message: string; rotatedAt: string }>("/security/api-key/rotate", {});
  },

  // Audit Logs
  getAuditLogs: async (filters?: SecurityAuditLogFilters): Promise<SecurityAuditLog[]> => {
    const params = new URLSearchParams();
    if (filters?.actionType) params.append("actionType", filters.actionType);
    if (filters?.resourceType) params.append("resourceType", filters.resourceType);
    if (filters?.severity) params.append("severity", filters.severity);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.userId) params.append("userId", filters.userId);
    if (filters?.search) params.append("search", filters.search);

    const queryString = params.toString();
    return api.get<SecurityAuditLog[]>(`/security/audit-logs${queryString ? `?${queryString}` : ""}`);
  },

  getAuditLog: async (logId: string): Promise<SecurityAuditLog> => {
    return api.get<SecurityAuditLog>(`/security/audit-logs/${logId}`);
  },

  // Compliance - Data Export
  requestDataExport: async (request: DataExportRequest): Promise<ComplianceRequest> => {
    return api.post<ComplianceRequest>("/security/compliance/export", request);
  },

  getDataExportStatus: async (requestId: string): Promise<ComplianceRequest> => {
    return api.get<ComplianceRequest>(`/security/compliance/export/${requestId}`);
  },

  downloadDataExport: async (requestId: string): Promise<Blob> => {
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/security/compliance/export/${requestId}/download`;
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(url, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to download data export');
    }

    return response.blob();
  },

  // Compliance - Data Deletion
  requestDataDeletion: async (request: DataDeletionRequest): Promise<ComplianceRequest> => {
    return api.post<ComplianceRequest>("/security/compliance/deletion", request);
  },

  getDataDeletionStatus: async (requestId: string): Promise<ComplianceRequest> => {
    return api.get<ComplianceRequest>(`/security/compliance/deletion/${requestId}`);
  },

  cancelDataDeletion: async (requestId: string): Promise<void> => {
    return api.post(`/security/compliance/deletion/${requestId}/cancel`, {});
  },

  // Compliance Requests
  getComplianceRequests: async (): Promise<ComplianceRequest[]> => {
    return api.get<ComplianceRequest[]>("/security/compliance/requests");
  },

  // PII Management
  getPIIStatus: async (): Promise<PIIStatus> => {
    return api.get<PIIStatus>("/security/pii/status");
  },

  getPIIManagementSettings: async (): Promise<PIIManagementSettings> => {
    return api.get<PIIManagementSettings>("/security/pii/settings");
  },

  updatePIIManagementSettings: async (settings: Partial<PIIManagementSettings>): Promise<PIIManagementSettings> => {
    return api.put<PIIManagementSettings>("/security/pii/settings", settings);
  },

  redactPII: async (fieldNames: string[]): Promise<{ message: string; redactedFields: string[] }> => {
    return api.post<{ message: string; redactedFields: string[] }>("/security/pii/redact", { fieldNames });
  },

  hashPII: async (fieldNames: string[]): Promise<{ message: string; hashedFields: string[] }> => {
    return api.post<{ message: string; hashedFields: string[] }>("/security/pii/hash", { fieldNames });
  },

  // Consent Logs
  getConsentLogs: async (): Promise<ConsentLog[]> => {
    return api.get<ConsentLog[]>("/security/consent-logs");
  },

  updateConsent: async (consentType: string, granted: boolean): Promise<ConsentLog> => {
    return api.post<ConsentLog>("/security/consent", { consentType, granted });
  },
};
