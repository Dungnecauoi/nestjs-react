import api from '../axios';
import { ApiResponse } from '../../types/auth.types';

export interface WebhookItem {
  id: string;
  name: string;
  url: string;
  secret?: string;
  events: string[];
  isActive: boolean;
  lastTriggeredAt?: string | null;
  createdAt: string;
}

export const webhooksApi = {
  getWebhooks: async (): Promise<WebhookItem[]> => {
    try {
      const res = await api.get<ApiResponse<WebhookItem[]>>('/webhooks');
      if (res.data.success && res.data.data) {
        return res.data.data;
      }
      return [];
    } catch {
      return [];
    }
  },

  createWebhook: async (payload: { name: string; url: string; events: string[]; secret?: string }): Promise<WebhookItem> => {
    const res = await api.post('/webhooks', payload);
    return res.data?.data || res.data;
  },

  testPing: async (id: string) => {
    const res = await api.post(`/webhooks/${id}/ping`);
    return res.data?.data || res.data;
  },

  deleteWebhook: async (id: string) => {
    const res = await api.delete(`/webhooks/${id}`);
    return res.data?.data || res.data;
  },
};
