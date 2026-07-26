import api from '../axios';
import { ApiResponse, User, PaginatedResponse } from '../../types/auth.types';

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  departmentId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const usersApi = {
  getUsers: async (params?: UserQueryParams): Promise<PaginatedResponse<User>> => {
    const res = await api.get<ApiResponse<PaginatedResponse<User>>>('/users', { params });
    if (res.data.success && res.data.data) {
      return res.data.data;
    }
    return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
  },

  getUser: async (id: string): Promise<User> => {
    const res = await api.get<ApiResponse<User>>(`/users/${id}`);
    return res.data?.data || res.data;
  },

  createUser: async (payload: Partial<User>) => {
    const res = await api.post('/users', payload);
    return res.data?.data || res.data;
  },

  updateUser: async (id: string, payload: Partial<User>) => {
    const res = await api.patch(`/users/${id}`, payload);
    return res.data?.data || res.data;
  },

  deleteUser: async (id: string) => {
    const res = await api.delete(`/users/${id}`);
    return res.data?.data || res.data;
  },

  approveUser: async (id: string) => {
    const res = await api.patch(`/users/${id}/approve`);
    return res.data?.data || res.data;
  },

  assignRoles: async (id: string, roles: string[]) => {
    const res = await api.post(`/users/${id}/roles`, { roleCodes: roles });
    return res.data?.data || res.data;
  },

  assignPermissions: async (id: string, permissions: string[]) => {
    const res = await api.post(`/users/${id}/permissions`, { permissionCodes: permissions });
    return res.data?.data || res.data;
  },
};
