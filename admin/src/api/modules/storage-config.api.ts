import api from '../axios';

export type StorageDriverName = 'local' | 's3';

export interface StorageConfigResponse {
  disk: StorageDriverName;
  s3?: {
    region: string;
    bucket: string;
    endpoint?: string;
    forcePathStyle?: boolean;
    configured: boolean;
  };
}

export interface StorageConfigSaveDto {
  disk: StorageDriverName;
  s3?: {
    accessKeyId?: string;
    secretAccessKey?: string;
    region?: string;
    bucket?: string;
    endpoint?: string;
    forcePathStyle?: boolean;
  };
}

export const storageConfigApi = {
  getStorageConfig: async (): Promise<StorageConfigResponse> => {
    const res = await api.get('/options/storage-config');
    return res.data?.data || res.data;
  },

  saveStorageConfig: async (dto: StorageConfigSaveDto): Promise<StorageConfigResponse> => {
    const res = await api.post('/options/storage-config', dto);
    return res.data?.data || res.data;
  },

  testConnection: async () => {
    const res = await api.post('/options/storage-config/test');
    return res.data?.data || res.data;
  },
};
