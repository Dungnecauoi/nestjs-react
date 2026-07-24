import api from '../axios';
import { ApiResponse, AuditLogItem, PaginatedAuditLogsResponse } from '../../types/auth.types';

export const auditApi = {
  getAuditLogs: async (params?: { page?: number; limit?: number; search?: string; module?: string; action?: string }) => {
    const res = await api.get<ApiResponse<PaginatedAuditLogsResponse>>('/audit-logs', { params });
    if (res.data.success && res.data.data) {
      return res.data.data;
    }
    return {
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    };
  },

  getAuditLogById: async (id: string): Promise<AuditLogItem> => {
    const res = await api.get<ApiResponse<AuditLogItem>>(`/audit-logs/${id}`);
    return res.data?.data || res.data;
  },

  deleteAuditLog: async (id: string) => {
    const res = await api.delete<ApiResponse<any>>(`/audit-logs/${id}`);
    return res.data?.data || res.data;
  },

  clearAllAuditLogs: async () => {
    const res = await api.post<ApiResponse<any>>('/audit-logs/clear');
    return res.data?.data || res.data;
  },
};
