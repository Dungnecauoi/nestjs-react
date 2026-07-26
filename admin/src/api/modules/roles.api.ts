import api from '../axios';
import { ApiResponse, Role, PaginatedResponse } from '../../types/auth.types';

export interface RoleQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const rolesApi = {
  getRoles: async (params?: RoleQueryParams): Promise<PaginatedResponse<Role>> => {
    try {
      const res = await api.get<ApiResponse<PaginatedResponse<Role>>>('/roles', { params });
      if (res.data.success && res.data.data) {
        return res.data.data;
      }
      return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    } catch {
      return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    }
  },

  getRoleById: async (id: string): Promise<Role | null> => {
    try {
      const res = await api.get<ApiResponse<Role>>(`/roles/${id}`);
      return res.data.data || null;
    } catch {
      return null;
    }
  },

  createRole: async (payload: { code: string; name: string; description?: string; permissionIds?: string[] }) => {
    const res = await api.post('/roles', payload);
    return res.data?.data || res.data;
  },

  updateRole: async (id: string, payload: { code?: string; name?: string; description?: string; permissionIds?: string[] }) => {
    const res = await api.put(`/roles/${id}`, payload);
    return res.data?.data || res.data;
  },

  assignPermissionsToRole: async (id: string, permissionIds: string[]) => {
    const res = await api.post(`/roles/${id}/permissions`, { permissionIds });
    return res.data?.data || res.data;
  },

  deleteRole: async (id: string) => {
    const res = await api.delete(`/roles/${id}`);
    return res.data?.data || res.data;
  },
};
