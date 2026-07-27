export interface StorageUploadResult {
  url: string;
  path: string;
}

export interface StorageDriver {
  upload(file: Express.Multer.File, keyPrefix?: string): Promise<StorageUploadResult>;
  delete(path: string): Promise<void>;
}
