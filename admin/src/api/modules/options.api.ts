import api from '../axios';
import { ApiResponse } from '../../types/auth.types';

// API Module for System Options
export const optionsApi = {
  getOptions: async (): Promise<Record<string, any>> => {
    const res = await api.get<ApiResponse<Record<string, any>>>('/options', {
      params: { _t: Date.now() },
    });
    return res.data?.data || {};
  },

  saveOptions: async (options: Record<string, any>) => {
    const res = await api.post('/options', options);
    return res.data?.data || res.data;
  },
};
