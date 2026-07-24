import api from '../axios';
import { ApiResponse, NotificationItem, PaginatedNotificationsResponse } from '../../types/auth.types';

export const notificationApi = {
  getNotifications: async (params?: { page?: number; limit?: number; search?: string; isRead?: string; type?: string }) => {
    const res = await api.get<ApiResponse<PaginatedNotificationsResponse>>('/notifications', { params });
    if (res.data.success && res.data.data) {
      return res.data.data;
    }
    return {
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0, unreadCount: 0 },
    };
  },

  markAsRead: async (id: string): Promise<NotificationItem> => {
    const res = await api.patch<ApiResponse<NotificationItem>>(`/notifications/${id}/read`);
    return res.data?.data || res.data;
  },

  markAllAsRead: async () => {
    const res = await api.patch<ApiResponse<any>>('/notifications/read-all');
    return res.data?.data || res.data;
  },

  deleteNotification: async (id: string) => {
    const res = await api.delete<ApiResponse<any>>(`/notifications/${id}`);
    return res.data?.data || res.data;
  },

  sendTestNotification: async (payload: { title: string; content: string; type?: string; userId?: string }) => {
    const res = await api.post<ApiResponse<NotificationItem>>('/notifications/test', payload);
    return res.data?.data || res.data;
  },
};
