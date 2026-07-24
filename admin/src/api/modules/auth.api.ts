// API Module for Auth
import api from '../axios';
import { ApiResponse, User } from '../../types/auth.types';

export const authApi = {
  login: async (credentials: { email: string; password?: string }) => {
    const res = await api.post('/auth/login', credentials);
    return res.data?.data || res.data;
  },

  authenticate2FA: async (payload: { preAuthToken: string; otpCode: string }) => {
    const res = await api.post('/auth/2fa/authenticate', payload);
    return res.data?.data || res.data;
  },

  generate2FASecret: async (email: string = 'admin@ecomcx.com') => {
    const res = await api.post('/auth/2fa/generate', { email });
    return res.data?.data || res.data;
  },

  turnOn2FA: async (email: string = 'admin@ecomcx.com', otpCode: string) => {
    const res = await api.post('/auth/2fa/turn-on', { email, otpCode });
    return res.data?.data || res.data;
  },

  turnOff2FA: async (email: string = 'admin@ecomcx.com') => {
    const res = await api.post('/auth/2fa/turn-off', { email });
    return res.data?.data || res.data;
  },

  getProfile: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>('/auth/profile');
    return res.data.data;
  },
};
