import type { AxiosProgressEvent } from 'axios';
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
  hash?: string | null;
  thumbnailUrl?: string | null;
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  // Chỉ có mặt ngay sau upload — báo file này là bản trùng SHA-256 được tái sử dụng,
  // không phải bản ghi mới tạo. Không phải cột DB thật, xem MediaService.createMedia().
  deduplicated?: boolean;
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

export interface UploadProgress {
  percent: number; // 0-100
  stage: 'uploading' | 'processing';
}

// Vượt ngưỡng này thì tự chuyển sang luồng chunked/resumable thay vì multipart 1 lần —
// khớp với backend (media.controller.ts upload-chunk/*), tránh timeout/mất hết tiến độ
// khi mạng chập chờn với file lớn.
const CHUNK_UPLOAD_THRESHOLD_BYTES = 20 * 1024 * 1024; // 20MB
const CHUNK_SIZE_BYTES = 5 * 1024 * 1024; // 5MB/mảnh

export const mediaApi = {
  getMediaList: async (params?: MediaQueryParams): Promise<PaginatedResponse<MediaItem>> => {
    const res = await api.get<ApiResponse<PaginatedResponse<MediaItem>>>('/media', { params });
    if (res.data.success && res.data.data) {
      return res.data.data;
    }
    return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
  },

  uploadMedia: async (file: File, onProgress?: (evt: AxiosProgressEvent) => void): Promise<MediaItem> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    });
    return res.data?.data || res.data;
  },

  initChunkUpload: async (dto: {
    filename: string;
    totalChunks: number;
    totalSize: number;
    mimetype?: string;
  }): Promise<{ uploadId: string; totalChunks: number }> => {
    const res = await api.post('/media/upload-chunk/init', dto);
    return res.data?.data || res.data;
  },

  uploadChunk: async (
    uploadId: string,
    chunkIndex: number,
    chunk: Blob,
    onProgress?: (evt: AxiosProgressEvent) => void,
  ) => {
    const formData = new FormData();
    formData.append('chunk', chunk, `chunk_${chunkIndex}`);
    formData.append('uploadId', uploadId);
    formData.append('chunkIndex', String(chunkIndex));
    const res = await api.post('/media/upload-chunk/chunk', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    });
    return res.data?.data || res.data;
  },

  completeChunkUpload: async (uploadId: string): Promise<MediaItem> => {
    const res = await api.post('/media/upload-chunk/complete', { uploadId });
    return res.data?.data || res.data;
  },

  // Tự chọn multipart 1 lần (file nhỏ) hoặc chunked/resumable (file lớn) và báo tiến độ
  // gộp qua onProgress — nơi gọi (trang Media) không cần biết luồng nào đang chạy bên dưới.
  smartUpload: async (
    file: File,
    opts: { onProgress?: (p: UploadProgress) => void } = {},
  ): Promise<MediaItem> => {
    const { onProgress } = opts;

    if (file.size <= CHUNK_UPLOAD_THRESHOLD_BYTES) {
      return mediaApi.uploadMedia(file, (evt) => {
        if (onProgress && evt.total) {
          onProgress({ percent: Math.round((evt.loaded / evt.total) * 100), stage: 'uploading' });
        }
      });
    }

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE_BYTES);
    const { uploadId } = await mediaApi.initChunkUpload({
      filename: file.name,
      totalChunks,
      totalSize: file.size,
      mimetype: file.type,
    });

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE_BYTES;
      const chunkBlob = file.slice(start, Math.min(start + CHUNK_SIZE_BYTES, file.size));
      await mediaApi.uploadChunk(uploadId, i, chunkBlob);
      if (onProgress) {
        onProgress({ percent: Math.round(((i + 1) / totalChunks) * 100), stage: 'uploading' });
      }
    }

    if (onProgress) onProgress({ percent: 100, stage: 'processing' });
    return mediaApi.completeChunkUpload(uploadId);
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
