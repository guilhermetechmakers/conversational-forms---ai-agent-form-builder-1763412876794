export interface SecuritySettings {
  encryptionAtRest: boolean;
  encryptionInTransit: boolean;
  twoFactorEnabled: boolean;
  apiKeyRotationDays: number;
  lastApiKeyRotation: string | null;
  sessionTimeoutMinutes: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  accessControl: {
    roleBasedAccess: boolean;
    ipWhitelist: string[];
    allowedDomains: string[];
  };
}

export interface SecurityAuditLog {
  id: string;
  userId: string;
  userEmail: string;
  actionType: SecurityAuditActionType;
  resourceType: string;
  resourceId: string | null;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export type SecurityAuditActionType =
  | 'api_key_rotated'
  | 'password_changed'
  | 'two_factor_enabled'
  | 'two_factor_disabled'
  | 'login_success'
  | 'login_failed'
  | 'data_exported'
  | 'data_deleted'
  | 'pii_redacted'
  | 'pii_hashed'
  | 'permission_granted'
  | 'permission_revoked'
  | 'webhook_configured'
  | 'agent_published'
  | 'agent_deleted'
  | 'workspace_settings_updated'
  | 'billing_updated'
  | 'user_invited'
  | 'user_removed';

export interface SecurityAuditLogFilters {
  actionType?: SecurityAuditActionType;
  resourceType?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  startDate?: string;
  endDate?: string;
  userId?: string;
  search?: string;
}

export interface ComplianceRequest {
  id: string;
  type: 'export' | 'deletion';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
  completedAt: string | null;
  downloadUrl: string | null;
  expiresAt: string | null;
  error: string | null;
}

export interface DataExportRequest {
  format: 'json' | 'csv';
  includePII: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface DataDeletionRequest {
  confirmText: string;
  reason?: string;
}

export interface PIIStatus {
  detected: boolean;
  fields: PIIField[];
  redactionEnabled: boolean;
  hashingEnabled: boolean;
}

export interface PIIField {
  fieldName: string;
  fieldType: 'email' | 'phone' | 'ssn' | 'credit_card' | 'address' | 'name' | 'other';
  detected: boolean;
  redacted: boolean;
  hashed: boolean;
}

export interface PIIManagementSettings {
  autoDetect: boolean;
  autoRedact: boolean;
  autoHash: boolean;
  redactionMethod: 'mask' | 'remove' | 'replace';
  hashingAlgorithm: 'sha256' | 'sha512' | 'bcrypt';
  fields: PIIField[];
}

export interface ConsentLog {
  id: string;
  userId: string;
  action: 'granted' | 'revoked' | 'updated';
  consentType: 'data_collection' | 'data_processing' | 'data_sharing' | 'marketing';
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, unknown>;
}
