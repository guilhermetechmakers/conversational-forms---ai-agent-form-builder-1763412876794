export interface SettingsUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  company?: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsWorkspace {
  id: string;
  name: string;
  slug: string;
  customDomain?: string;
  defaultAgentSettings?: Record<string, unknown>;
  slugPolicy?: 'strict' | 'flexible';
  createdAt: string;
  updatedAt: string;
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt?: string;
  createdAt: string;
  expiresAt?: string;
  status: 'active' | 'revoked' | 'expired';
}

export interface TeamMember {
  id: string;
  userId: string;
  workspaceId: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  status: 'active' | 'pending' | 'suspended';
  invitedAt: string;
  joinedAt?: string;
}

export interface SecurityLog {
  id: string;
  userId: string;
  actionType: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}

export interface SessionHistory {
  id: string;
  device: string;
  location?: string;
  ipAddress: string;
  lastActive: string;
  current: boolean;
}

export interface UpdateAccountData {
  name?: string;
  email?: string;
  avatar?: string;
  company?: string;
}

export interface UpdateWorkspaceData {
  name?: string;
  slug?: string;
  customDomain?: string;
  slugPolicy?: 'strict' | 'flexible';
  defaultAgentSettings?: Record<string, unknown>;
}

export interface CreateApiKeyData {
  name: string;
  expiresInDays?: number;
}

export interface InviteTeamMemberData {
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

export interface UpdateTeamMemberData {
  role?: 'admin' | 'editor' | 'viewer';
  status?: 'active' | 'suspended';
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SettingsSecuritySettings {
  twoFactorEnabled: boolean;
  ssoEnabled: boolean;
  sessionTimeout?: number;
}
