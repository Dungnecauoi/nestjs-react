import api from '../axios';
import { ApiResponse, Department } from '../../types/auth.types';

export const departmentsApi = {
  getDepartments: async (): Promise<Department[]> => {
    try {
      const res = await api.get<ApiResponse<Department[]>>('/departments');
      if (res.data.success && res.data.data) {
        return res.data.data;
      }
      return [];
    } catch {
      return [];
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
