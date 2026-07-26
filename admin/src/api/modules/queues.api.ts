import api from '../axios';
import { ApiResponse } from '../../types/auth.types';

export interface QueueStatsResponse {
  mailQueue: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    total: number;
  };
}

export const queuesApi = {
  getQueueStats: async (): Promise<QueueStatsResponse> => {
    const res = await api.get<ApiResponse<QueueStatsResponse>>('/queues/stats');
    return res.data?.data || res.data;
  },

  cleanCompleted: async () => {
    const res = await api.post('/queues/clean-completed');
    return res.data?.data || res.data;
  },

  cleanFailed: async () => {
    const res = await api.post('/queues/clean-failed');
    return res.data?.data || res.data;
  },
};
