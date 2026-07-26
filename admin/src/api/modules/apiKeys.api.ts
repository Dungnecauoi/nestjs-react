import api from '../axios';
import { ApiResponse } from '../../types/auth.types';

export interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  permissions: string[];
  isActive: boolean;
  lastUsedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
}

export interface CreateApiKeyResponse {
  apiKey: ApiKeyItem;
  rawSecretKey: string;
  warning: string;
}

export const apiKeysApi = {
  getApiKeys: async (): Promise<ApiKeyItem[]> => {
    try {
      const res = await api.get<ApiResponse<ApiKeyItem[]>>('/api-keys');
      if (res.data.success && res.data.data) {
        return res.data.data;
      }
      return [];
    } catch {
      return [];
    }
  },

  createApiKey: async (payload: { name: string; permissions?: string[]; expiresAt?: string }): Promise<CreateApiKeyResponse> => {
    const res = await api.post('/api-keys', payload);
    return res.data?.data || res.data;
  },

  revokeApiKey: async (id: string) => {
    const res = await api.patch(`/api-keys/${id}/revoke`);
    return res.data?.data || res.data;
  },

  restoreApiKey: async (id: string) => {
    const res = await api.patch(`/api-keys/${id}/restore`);
    return res.data?.data || res.data;
  },

  deleteApiKey: async (id: string) => {
    const res = await api.delete(`/api-keys/${id}`);
    return res.data?.data || res.data;
  },
};
