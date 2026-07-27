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

  generate2FASecret: async () => {
    const res = await api.post('/auth/2fa/generate');
    return res.data?.data || res.data;
  },

  turnOn2FA: async (otpCode: string) => {
    const res = await api.post('/auth/2fa/turn-on', { otpCode });
    return res.data?.data || res.data;
  },

  turnOff2FA: async (otpCode: string) => {
    const res = await api.post('/auth/2fa/turn-off', { otpCode });
    return res.data?.data || res.data;
  },

  getProfile: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>('/auth/profile');
    return res.data.data;
  },

  updateProfile: async (payload: {
    name?: string;
    avatarMediaId?: string;
    phone?: string;
    identityCard?: string;
    gender?: string;
    dateOfBirth?: string;
    address?: string;
    bio?: string;
  }): Promise<User> => {
    const res = await api.patch<ApiResponse<User>>('/auth/profile', payload);
    return res.data.data;
  },

  forgotPassword: async (email: string) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data?.data || res.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const res = await api.post('/auth/reset-password', { token, newPassword });
    return res.data?.data || res.data;
  },

  verifyEmail: async (token: string) => {
    const res = await api.post('/auth/verify-email', { token });
    return res.data?.data || res.data;
  },
};
