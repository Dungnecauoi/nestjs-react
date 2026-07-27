import * as fs from 'fs';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { StorageDriver, StorageUploadResult } from './storage-driver.interface';

export interface S3DriverConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
  // endpoint + forcePathStyle: tương thích MinIO / bất kỳ dịch vụ S3-compatible nào khác,
  // không chỉ AWS S3 thật.
  endpoint?: string;
  forcePathStyle?: boolean;
}

export class S3Driver implements StorageDriver {
  private readonly client: S3Client;

  constructor(private readonly config: S3DriverConfig) {
    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      ...(config.endpoint && { endpoint: config.endpoint }),
      ...(config.forcePathStyle && { forcePathStyle: true }),
    });
  }

  async upload(file: Express.Multer.File, keyPrefix = 'uploads'): Promise<StorageUploadResult> {
    const ext = extname(file.originalname).toLowerCase();
    const key = `${keyPrefix}/${randomUUID()}${ext}`;

    // Stream từ file multer đã ghi tạm trên đĩa — KHÔNG buffer cả file vào RAM (file.buffer
    // không tồn tại khi multer dùng diskStorage), an toàn với file lớn (100-200MB+).
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: fs.createReadStream(file.path),
        ContentType: file.mimetype,
        ContentLength: file.size,
      }),
    );

    // Nơi lưu chính thức giờ là S3 — xoá file tạm local, best-effort không chặn luồng chính.
    try {
      fs.unlinkSync(file.path);
    } catch {
      // ignore
    }

    const url = this.config.endpoint
      ? `${this.config.endpoint.replace(/\/$/, '')}/${this.config.bucket}/${key}`
      : `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`;

    return { url, path: key };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.config.bucket, Key: key }),
    );
  }

  async testConnection(): Promise<void> {
    await this.client.send(new HeadBucketCommand({ Bucket: this.config.bucket }));
  }
}
