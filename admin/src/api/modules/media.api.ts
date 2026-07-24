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
      return [
        {
          id: '1',
          filename: 'company-logo.webp',
          filepath: '/uploads/company-logo.webp',
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
          mimetype: 'image/webp',
          size: 48500,
          disk: 'local',
          title: 'Logo Công Ty ECOMCX',
          altText: 'Biểu tượng thương hiệu công ty',
          caption: 'Logo doanh nghiệp chính thức',
          description: 'Ảnh đại diện sử dụng trên các báo cáo xuất bản',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          filename: 'banner-hero.png',
          filepath: '/uploads/banner-hero.png',
          url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400',
          mimetype: 'image/png',
          size: 245000,
          disk: 'local',
          title: 'Banner Giới Thiệu ERP',
          altText: 'Banner giới thiệu hệ thống ERP',
          caption: 'Ảnh bìa trang chủ',
          description: 'Hình nền banner tổng quan hệ thống',
          createdAt: new Date().toISOString(),
        },
      ];
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

  deleteMedia: async (id: string) => {
    const res = await api.delete(`/media/${id}`);
    return res.data?.data || res.data;
  },
};
