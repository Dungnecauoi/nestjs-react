import api from '../axios';
import { ApiResponse } from '../../types/auth.types';

export interface SessionItem {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  updatedAt: string;
  isCurrent: boolean;
}

export const sessionsApi = {
  getSessions: async (): Promise<SessionItem[]> => {
    const res = await api.get<ApiResponse<SessionItem[]>>('/auth/sessions');
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : [];
  },

  revokeSession: async (id: string) => {
    const res = await api.delete(`/auth/sessions/${id}`);
    return res.data?.data || res.data;
  },
};
