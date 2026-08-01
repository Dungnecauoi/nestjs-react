import { Injectable, BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Đây chỉ là lưới an toàn NGOÀI CÙNG (superset của mọi loại Settings có thể cho phép) — vì
// multer's FileInterceptor được Nest resolve 1 lần lúc load module, không đọc DB động per-request
// được. Giới hạn THẬT theo cấu hình admin (allowedImageTypes/allowedVideoTypes ở Settings) được
// enforce lại trong MediaService.createMedia() bằng OptionsService (đọc sống mỗi request).
export const ALLOWED_UPLOAD_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'video/quicktime', // .mov
  'video/x-matroska', // .mkv
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/octet-stream', // Cho phép binary/chunk uploads
  'binary/octet-stream',
];

export const ALLOWED_UPLOAD_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.svg',
  '.mp4',
  '.webm',
  '.mov',
  '.mkv',
  '.pdf',
  '.docx',
  '.xlsx',
  '.tmp',
  '.part',
  '.bin',
  '.chunk',
  '',
];

// Chỉ còn cấu hình multer (đọc lưới an toàn tĩnh ở trên) — driver lưu trữ THẬT (local/S3/MinIO)
// do StorageConfigService quyết định lúc runtime từ config DB, xem MediaService.createMedia().
// Trước đây có thêm 1 đường S3 riêng dựa env (FILESYSTEM_DISK/AWS_*) không ai gọi tới
// (uploadToS3()) — 2 cơ chế cấu hình storage song song dễ gây nhầm lẫn nên đã bỏ.
@Injectable()
export class StorageService {
  static getMulterConfig() {
    const uploadSubFolder = new Date().toISOString().slice(0, 7); // e.g. 2026-07

    return {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = `./uploads/${uploadSubFolder}`.replace(
            /\/+/g,
            '/',
          );
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      limits: {
        // Trần cứng an toàn (chặn payload phi lý) — KHÔNG phải giới hạn thật, giới hạn thật
        // theo Settings (maxImageSizeMb/maxVideoSizeMb) được enforce trong MediaService.
        fileSize: 10 * 1024 * 1024 * 1024, // 10GB
      },
      fileFilter: (req: any, file: any, callback: any) => {
        const ext = extname(file.originalname).toLowerCase();
        const isChunk =
          file.fieldname === 'chunk' ||
          file.mimetype === 'application/octet-stream' ||
          file.mimetype === 'binary/octet-stream' ||
          !ext;

        if (
          isChunk ||
          ALLOWED_UPLOAD_MIME_TYPES.includes(file.mimetype) ||
          ALLOWED_UPLOAD_EXTENSIONS.includes(ext)
        ) {
          return callback(null, true);
        }

        return callback(
          new BadRequestException('Định dạng file không được hỗ trợ!'),
          false,
        );
      },
    };
  }
}
