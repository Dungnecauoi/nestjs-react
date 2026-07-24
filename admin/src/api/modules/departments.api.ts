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
      return [
        {
          id: '1',
          code: 'BGD',
          name: 'Ban Giám Đốc (BGD)',
          description: 'Hội đồng quản trị và điều hành doanh nghiệp',
        },
        {
          id: '2',
          code: 'HR',
          name: 'Phòng Nhân Sự (HR)',
          description: 'Tuyển dụng, đào tạo và quản lý nhân sự',
          parentId: '1',
        },
        {
          id: '3',
          code: 'TECH',
          name: 'Phòng Công Nghệ (IT/Tech)',
          description: 'Phát triển phần mềm và hạ tầng hệ thống',
          parentId: '1',
        },
      ];
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
