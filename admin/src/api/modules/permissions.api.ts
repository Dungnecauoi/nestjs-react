import api from '../axios';

export interface PermissionItem {
  id: string;
  code: string;
  name: string;
  module: string;
  description?: string;
}

export const permissionsApi = {
  getPermissions: async (): Promise<PermissionItem[]> => {
    try {
      const res = await api.get<any>('/permissions');
      const rawData = res.data?.data || res.data;
      if (Array.isArray(rawData)) {
        return rawData;
      }
      if (rawData && Array.isArray(rawData.list)) {
        return rawData.list;
      }
      return [];
    } catch {
      return [];
    }
  },
};
