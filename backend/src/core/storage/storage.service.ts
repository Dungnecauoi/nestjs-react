import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class StorageService {
  private disk: string;
  private s3Client?: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.disk = this.configService.get<string>('storage.disk') || 'local';

    if (this.disk === 's3' || this.disk === 'minio') {
      const accessKeyId = this.configService.get<string>('storage.aws.accessKeyId');
      const secretAccessKey = this.configService.get<string>('storage.aws.secretAccessKey');
      const region = this.configService.get<string>('storage.aws.region');

      if (accessKeyId && secretAccessKey) {
        this.s3Client = new S3Client({
          region,
          credentials: { accessKeyId, secretAccessKey },
        });
      }
    }
  }

  // Multer Storage Configuration Generator for Local Disk
  static getMulterConfig(uploadSubFolder = '') {
    return {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = `./uploads/${uploadSubFolder}`.replace(/\/+/g, '/');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB default
      },
      fileFilter: (req: any, file: any, callback: any) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|pdf|docx|xlsx)$/)) {
          return callback(new BadRequestException('Định dạng file không được hỗ trợ!'), false);
        }
        callback(null, true);
      },
    };
  }

  async uploadToS3(file: Express.Multer.File, keyPrefix = 'uploads'): Promise<string> {
    if (!this.s3Client) {
      throw new Error('S3 Client chưa được cấu hình AWS credentials');
    }

    const bucket = this.configService.get<string>('storage.aws.bucket');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const key = `${keyPrefix}/${uniqueSuffix}-${file.originalname}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return `https://${bucket}.s3.amazonaws.com/${key}`;
  }
}
