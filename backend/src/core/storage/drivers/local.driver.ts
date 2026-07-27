import * as fs from 'fs';
import * as path from 'path';
import { StorageDriver, StorageUploadResult } from './storage-driver.interface';

export interface LocalDriverConfig {
  appUrl: string;
}

export class LocalDriver implements StorageDriver {
  constructor(private readonly config: LocalDriverConfig) {}

  async upload(file: Express.Multer.File): Promise<StorageUploadResult> {
    // File đã được multer diskStorage ghi sẵn vào ./uploads/<file.filename> trước khi driver
    // này chạy — chỉ cần build lại URL công khai.
    const relativePath = `/uploads/${file.filename}`;
    return { url: `${this.config.appUrl}${relativePath}`, path: relativePath };
  }

  async delete(filePath: string): Promise<void> {
    const relative = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    const fullPath = path.join(process.cwd(), relative);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
}
