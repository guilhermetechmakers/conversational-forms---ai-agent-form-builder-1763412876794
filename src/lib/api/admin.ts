import { api } from '@/lib/api';
import type {
  AdminUser,
  AdminAgent,
  AbuseReport,
  SystemMetrics,
  AuditLog,
  AuditLogFilters,
  InviteUserInput,
  UpdateUserRoleInput,
  SuspendUserInput,
  UpdateAbuseReportInput,
} from '@/types/admin';

export const adminApi = {
  // User Management
  getUsers: async (): Promise<AdminUser[]> => {
    return api.get<AdminUser[]>('/admin/users');
  },

  getUser: async (userId: string): Promise<AdminUser> => {
    return api.get<AdminUser>(`/admin/users/${userId}`);
  },

  updateUserRole: async (data: UpdateUserRoleInput): Promise<AdminUser> => {
    return api.patch<AdminUser>(`/admin/users/${data.user_id}/role`, { role: data.role });
  },

  suspendUser: async (data: SuspendUserInput): Promise<AdminUser> => {
    return api.post<AdminUser>(`/admin/users/${data.user_id}/suspend`, { reason: data.reason });
  },

  unsuspendUser: async (userId: string): Promise<AdminUser> => {
    return api.post<AdminUser>(`/admin/users/${userId}/unsuspend`, {});
  },

  inviteUser: async (data: InviteUserInput): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/admin/users/invite', data);
  },

  // Agent Oversight
  getAgents: async (): Promise<AdminAgent[]> => {
    return api.get<AdminAgent[]>('/admin/agents');
  },

  getAgent: async (agentId: string): Promise<AdminAgent> => {
    return api.get<AdminAgent>(`/admin/agents/${agentId}`);
  },

  getAbuseReports: async (agentId?: string): Promise<AbuseReport[]> => {
    const endpoint = agentId ? `/admin/abuse-reports?agent_id=${agentId}` : '/admin/abuse-reports';
    return api.get<AbuseReport[]>(endpoint);
  },

  updateAbuseReport: async (data: UpdateAbuseReportInput): Promise<AbuseReport> => {
    return api.patch<AbuseReport>(`/admin/abuse-reports/${data.report_id}`, {
      status: data.status,
      notes: data.notes,
    });
  },

  // System Metrics
  getSystemMetrics: async (): Promise<SystemMetrics> => {
    return api.get<SystemMetrics>('/admin/metrics');
  },

  // Audit Logs
  getAuditLogs: async (filters?: AuditLogFilters): Promise<AuditLog[]> => {
    const params = new URLSearchParams();
    if (filters?.event_type) params.append('event_type', filters.event_type);
    if (filters?.user_id) params.append('user_id', filters.user_id);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.search) params.append('search', filters.search);

    const query = params.toString();
    const endpoint = query ? `/admin/audit-logs?${query}` : '/admin/audit-logs';
    return api.get<AuditLog[]>(endpoint);
  },

  exportAuditLogs: async (filters?: AuditLogFilters): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters?.event_type) params.append('event_type', filters.event_type);
    if (filters?.user_id) params.append('user_id', filters.user_id);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.search) params.append('search', filters.search);

    const query = params.toString();
    const endpoint = query ? `/admin/audit-logs/export?${query}` : '/admin/audit-logs/export';
    
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}${endpoint}`;
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(url, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to export audit logs');
    }

    return response.blob();
  },
};
