import { api } from "@/lib/api";
import type {
  SettingsUser,
  SettingsWorkspace,
  ApiKey,
  TeamMember,
  SecurityLog,
  SessionHistory,
  UpdateAccountData,
  UpdateWorkspaceData,
  CreateApiKeyData,
  InviteTeamMemberData,
  UpdateTeamMemberData,
  UpdatePasswordData,
  SettingsSecuritySettings,
} from "@/types/settings";

export const settingsApi = {
  // User/Account
  getUser: () => api.get<SettingsUser>("/settings/user"),
  updateUser: (data: UpdateAccountData) => api.put<SettingsUser>("/settings/user", data),
  updatePassword: (data: UpdatePasswordData) => api.post<{ success: boolean }>("/settings/password", data),

  // Workspace
  getWorkspace: () => api.get<SettingsWorkspace>("/settings/workspace"),
  updateWorkspace: (data: UpdateWorkspaceData) => api.put<SettingsWorkspace>("/settings/workspace", data),

  // API Keys
  getApiKeys: () => api.get<ApiKey[]>("/settings/api-keys"),
  createApiKey: (data: CreateApiKeyData) => api.post<{ key: string; apiKey: ApiKey }>("/settings/api-keys", data),
  revokeApiKey: (id: string) => api.delete(`/settings/api-keys/${id}`) as Promise<{ success: boolean }>,

  // Team Management
  getTeamMembers: () => api.get<TeamMember[]>("/settings/team"),
  inviteTeamMember: (data: InviteTeamMemberData) => api.post<TeamMember>("/settings/team/invite", data),
  updateTeamMember: (id: string, data: UpdateTeamMemberData) => api.put<TeamMember>(`/settings/team/${id}`, data),
  removeTeamMember: (id: string) => api.delete(`/settings/team/${id}`) as Promise<{ success: boolean }>,

  // Security
  getSecuritySettings: () => api.get<SettingsSecuritySettings>("/settings/security"),
  updateSecuritySettings: (data: Partial<SettingsSecuritySettings>) => api.put<SettingsSecuritySettings>("/settings/security", data),
  getSecurityLogs: (limit?: number) => api.get<SecurityLog[]>(`/settings/security/logs${limit ? `?limit=${limit}` : ""}`),
  getSessionHistory: () => api.get<SessionHistory[]>("/settings/security/sessions"),
  revokeSession: (id: string) => api.delete(`/settings/security/sessions/${id}`) as Promise<{ success: boolean }>,
  revokeAllSessions: () => api.post<{ success: boolean }>("/settings/security/sessions/revoke-all", {}),

  // Data & Privacy
  exportData: () => api.post<{ downloadUrl: string }>("/settings/data/export", {}),
  deleteAccount: (password: string) => api.post<{ success: boolean }>("/settings/data/delete-account", { password }),
  updateDataRetention: (days: number) => api.put<{ success: boolean }>("/settings/data/retention", { days }),
};
