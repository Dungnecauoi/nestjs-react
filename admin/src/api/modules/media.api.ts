import api from '../axios';
import { ApiResponse } from '../../types/auth.types';

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

export const mediaApi = {
  getMediaList: async (): Promise<MediaItem[]> => {
    try {
      const res = await api.get<ApiResponse<MediaItem[]>>('/media');
      if (res.data.success && res.data.data) {
        return res.data.data;
      }
      return [];
    } catch {
      return [];
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
