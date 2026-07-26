import api from '../axios';
import { ApiResponse, Department, PaginatedResponse } from '../../types/auth.types';

export interface DepartmentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  parentId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const departmentsApi = {
  getDepartments: async (params?: DepartmentQueryParams): Promise<PaginatedResponse<Department>> => {
    try {
      const res = await api.get<ApiResponse<PaginatedResponse<Department>>>('/departments', { params });
      if (res.data.success && res.data.data) {
        return res.data.data;
      }
      return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    } catch {
      return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    }
  },

  createDepartment: async (payload: Partial<Department>) => {
    const res = await api.post('/departments', payload);
    return res.data?.data || res.data;
  },

  updateDepartment: async (id: string, payload: Partial<Department>) => {
    const res = await api.patch(`/departments/${id}`, payload);
    return res.data?.data || res.data;
  },

  deleteDepartment: async (id: string) => {
    const res = await api.delete(`/departments/${id}`);
    return res.data?.data || res.data;
  },
};
