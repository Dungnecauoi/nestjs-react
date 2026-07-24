// API Module for Roles
import api from '../axios';
import { ApiResponse, Role } from '../../types/auth.types';

export const rolesApi = {
  getRoles: async (): Promise<Role[]> => {
    try {
      const res = await api.get<ApiResponse<Role[]>>('/roles');
      if (res.data.success && res.data.data) {
        return res.data.data;
      }
      return [];
    } catch {
      return [];
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
