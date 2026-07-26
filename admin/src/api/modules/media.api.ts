import api from '../axios';
import { ApiResponse, PaginatedResponse } from '../../types/auth.types';

export interface MediaItem {
  id: string;
  filename: string;
  filepath: string;
  url: string;
  mimetype: string;
  size: number;
  disk: string;
  title?: string;
  altText?: string;
  caption?: string;
  description?: string;
  createdAt: string;
}

export interface MediaQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  mimetype?: string;
  disk?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const mediaApi = {
  getMediaList: async (params?: MediaQueryParams): Promise<PaginatedResponse<MediaItem>> => {
    try {
      const res = await api.get<ApiResponse<PaginatedResponse<MediaItem>>>('/media', { params });
      if (res.data.success && res.data.data) {
        return res.data.data;
      }
      return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    } catch {
      return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    }
  },

  uploadMedia: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.data || res.data;
  },

  updateMedia: async (id: string, dto: { title?: string; altText?: string; caption?: string; description?: string }) => {
    const res = await api.patch(`/media/${id}`, dto);
    return res.data?.data || res.data;
  },

  replaceMedia: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.patch(`/media/${id}/replace`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.data || res.data;
  },

  deleteMedia: async (id: string) => {
    const res = await api.delete(`/media/${id}`);
    return res.data?.data || res.data;
  },
};
