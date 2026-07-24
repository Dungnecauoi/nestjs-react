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
      return [
        {
          id: '1',
          code: 'ADMIN',
          name: 'Quản Trị Viên Tối Cao (Admin)',
          description: 'Quản trị viên với toàn bộ quyền hạn hệ thống',
        },
        {
          id: '2',
          code: 'MANAGER',
          name: 'Quản Lý Nhân Sự (Manager)',
          description: 'Quản lý trực tiếp danh sách nhân viên và phòng ban',
        },
        {
          id: '3',
          code: 'STAFF',
          name: 'Nhân Viên (Staff)',
          description: 'Thành viên sử dụng cơ bản',
        },
      ];
    }
  },

  createRole: async (payload: Partial<Role>) => {
    const res = await api.post('/roles', payload);
    return res.data?.data || res.data;
  },

  updateRole: async (id: string, payload: Partial<Role>) => {
    const res = await api.patch(`/roles/${id}`, payload);
    return res.data?.data || res.data;
  },

  deleteRole: async (id: string) => {
    const res = await api.delete(`/roles/${id}`);
    return res.data?.data || res.data;
  },
};
