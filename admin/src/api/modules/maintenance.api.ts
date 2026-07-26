import api from '../axios';
import { ApiResponse } from '../../types/auth.types';

export interface MaintenanceStatusResponse {
  maintenanceMode: boolean;
}

export const maintenanceApi = {
  getStatus: async (): Promise<MaintenanceStatusResponse> => {
    const res = await api.get<ApiResponse<MaintenanceStatusResponse>>('/maintenance/status');
    return res.data?.data || res.data;
  },

  toggleMode: async (enabled: boolean) => {
    const res = await api.post('/maintenance/toggle', { enabled });
    return res.data?.data || res.data;
  },

  downloadBackup: async () => {
    const res = await api.get('/maintenance/backup', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `backup_core_erp_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
