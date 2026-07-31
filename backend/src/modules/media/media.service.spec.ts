import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import * as fs from 'fs';
import * as path from 'path';
import { MediaService } from './media.service';
import { PrismaService } from '../../core/database/prisma.service';
import { OptionsService } from '../../core/options/options.service';
import { StorageConfigService } from '../../core/storage/storage-config.service';
import { WebhookService } from '../webhook/webhook.service';

const uploadsDir = path.join(process.cwd(), 'uploads');

function writeTempFile(content: string): string {
  const filePath = path.join(uploadsDir, `spec-tmp-${Date.now()}-${Math.round(Math.random() * 1e9)}.bin`);
  fs.writeFileSync(filePath, content);
  return filePath;
}

function makeMulterFile(overrides: Partial<Express.Multer.File> & { content?: string } = {}): Express.Multer.File {
  const tempPath = overrides.path ?? writeTempFile(overrides.content ?? 'hello world');
  return {
    fieldname: 'file',
    originalname: 'test.txt',
    encoding: '7bit',
    mimetype: 'text/plain',
    size: 11,
    destination: path.dirname(tempPath),
    filename: path.basename(tempPath),
    buffer: Buffer.from([]),
    stream: null as any,
    ...overrides,
    path: tempPath,
  };
}

describe('MediaService', () => {
  let service: MediaService;
  let prisma: { media: { findFirst: jest.Mock; create: jest.Mock; findUnique: jest.Mock; update: jest.Mock } };
  let optionsService: { getAllOptions: jest.Mock };
  let storageConfigService: { getEffectiveDriver: jest.Mock; getDriverForDisk: jest.Mock };

  // Mọi test dùng fs thật trên backend/uploads/ (module không có abstraction filesystem) —
  // dọn dẹp toàn bộ đường dẫn phát sinh sau mỗi test để không để lại rác/ảnh hưởng test khác.
  const cleanupPaths: string[] = [];
  const trackCleanup = (p: string) => {
    cleanupPaths.push(p);
    return p;
  };

  beforeEach(async () => {
    prisma = {
      media: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn(async ({ data }: any) => ({ id: 'new-id', ...data, createdAt: new Date(), updatedAt: new Date() })),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    optionsService = { getAllOptions: jest.fn().mockResolvedValue({}) };
    storageConfigService = {
      getEffectiveDriver: jest.fn().mockResolvedValue({
        driver: {
          upload: jest.fn(async (file: Express.Multer.File) => ({
            path: `/uploads/${file.filename}`,
            url: `http://localhost/uploads/${file.filename}`,
          })),
        },
        disk: 'local',
      }),
      getDriverForDisk: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        { provide: PrismaService, useValue: prisma },
        { provide: I18nService, useValue: { t: (key: string) => key } },
        { provide: WebhookService, useValue: { triggerWebhooks: jest.fn().mockResolvedValue(undefined) } },
        { provide: OptionsService, useValue: optionsService },
        { provide: StorageConfigService, useValue: storageConfigService },
      ],
    }).compile();

    service = module.get(MediaService);
  });

  afterEach(() => {
    for (const p of cleanupPaths.splice(0)) {
      try {
        fs.rmSync(p, { recursive: true, force: true });
      } catch {
        // best-effort
      }
    }
  });

  // Lưới an toàn cuối cùng: một vài nhánh lỗi (vd completeChunkUpload thiếu chunk) để lại file
  // merge dở dang mà test riêng lẻ không track path chính xác được (tên file có Date.now()).
  afterAll(() => {
    for (const entry of fs.readdirSync(uploadsDir)) {
      if (entry.startsWith('spec-tmp-') || entry.startsWith('merged_')) {
        try {
          fs.rmSync(path.join(uploadsDir, entry), { recursive: true, force: true });
        } catch {
          // best-effort
        }
      }
    }
  });

  describe('createMedia', () => {
    it('creates a new record and returns deduplicated: false when no hash matches', async () => {
      const file = makeMulterFile();
      trackCleanup(file.path);

      const result: any = await service.createMedia(file, 'user-1');

      expect(result.deduplicated).toBe(false);
      expect(result.createdById).toBe('user-1');
      expect(prisma.media.create).toHaveBeenCalledTimes(1);
    });

    it('reuses the existing record and returns deduplicated: true on a SHA-256 hash match', async () => {
      prisma.media.findFirst.mockResolvedValueOnce({ id: 'existing-id', hash: 'deadbeef' });
      const file = makeMulterFile();

      const result: any = await service.createMedia(file, 'user-1');

      expect(result).toMatchObject({ id: 'existing-id', deduplicated: true });
      expect(prisma.media.create).not.toHaveBeenCalled();
      expect(fs.existsSync(file.path)).toBe(false); // temp file deleted, no duplicate stored
    });

    it('skips deduplication when media_enable_sha256_deduplication is off', async () => {
      optionsService.getAllOptions.mockResolvedValue({ media_enable_sha256_deduplication: false });
      prisma.media.findFirst.mockResolvedValueOnce({ id: 'existing-id', hash: 'deadbeef' });
      const file = makeMulterFile();
      trackCleanup(file.path);

      const result: any = await service.createMedia(file, 'user-1');

      expect(prisma.media.findFirst).not.toHaveBeenCalled();
      expect(result.deduplicated).toBe(false);
      expect(prisma.media.create).toHaveBeenCalledTimes(1);
    });

    it('rejects a file larger than the configured max size', async () => {
      optionsService.getAllOptions.mockResolvedValue({ maxImageSizeMb: 1 });
      const file = makeMulterFile({ mimetype: 'image/jpeg', originalname: 'big.jpg', size: 5 * 1024 * 1024 });
      trackCleanup(file.path);

      await expect(service.createMedia(file, 'user-1')).rejects.toThrow(BadRequestException);
      expect(fs.existsSync(file.path)).toBe(false); // rejected upload's temp file is cleaned up
    });

    it('rejects a disallowed file extension', async () => {
      optionsService.getAllOptions.mockResolvedValue({ allowedImageTypes: ['png'] });
      const file = makeMulterFile({ mimetype: 'image/jpeg', originalname: 'photo.jpg', size: 100 });
      trackCleanup(file.path);

      await expect(service.createMedia(file, 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('does not enforce type/size limits for non-image/video files', async () => {
      optionsService.getAllOptions.mockResolvedValue({ maxImageSizeMb: 1 });
      const file = makeMulterFile({ mimetype: 'application/pdf', originalname: 'doc.pdf', size: 5 * 1024 * 1024 });
      trackCleanup(file.path);

      await expect(service.createMedia(file, 'user-1')).resolves.toBeDefined();
    });
  });

  describe('chunked upload', () => {
    it('completes a full init -> chunk -> complete flow and merges bytes in order', async () => {
      const { uploadId } = await service.initChunkUpload(
        { filename: 'merged.txt', totalChunks: 2, totalSize: 11, mimetype: 'text/plain' },
        'user-1',
      );
      trackCleanup(path.join(uploadsDir, 'chunks', uploadId));

      await service.saveChunkSlice(makeMulterFile({ content: 'hello ' }), uploadId, 0, 'user-1');
      await service.saveChunkSlice(makeMulterFile({ content: 'world' }), uploadId, 1, 'user-1');

      const result: any = await service.completeChunkUpload(uploadId, 'user-1');
      trackCleanup(path.join(process.cwd(), result.filepath.replace(/^\//, '')));

      expect(result.filename).toBe('merged.txt');
      expect(result.size).toBe(11); // 'hello world'.length
      expect(result.deduplicated).toBe(false);
      expect(fs.existsSync(path.join(uploadsDir, 'chunks', uploadId))).toBe(false); // session dir cleaned up
    });

    it('rejects an uploadId that does not match the server-generated pattern (path traversal guard)', async () => {
      const chunk = makeMulterFile();

      await expect(service.saveChunkSlice(chunk, '../../../etc/passwd', 0, 'user-1')).rejects.toThrow(BadRequestException);
      await expect(service.completeChunkUpload('../../../etc/passwd', 'user-1')).rejects.toThrow(BadRequestException);
      expect(fs.existsSync(chunk.path)).toBe(false); // temp chunk cleaned up even on early rejection
    });

    it('rejects a well-formed but nonexistent upload session', async () => {
      await expect(service.completeChunkUpload('chunk_1111111111111_222222222', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('blocks a different user from uploading into or completing someone else’s session', async () => {
      const { uploadId } = await service.initChunkUpload(
        { filename: 'owned.txt', totalChunks: 1, totalSize: 5, mimetype: 'text/plain' },
        'owner-1',
      );
      trackCleanup(path.join(uploadsDir, 'chunks', uploadId));

      await expect(service.saveChunkSlice(makeMulterFile(), uploadId, 0, 'someone-else')).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.completeChunkUpload(uploadId, 'someone-else')).rejects.toThrow(ForbiddenException);
    });

    it('allows the session owner through where a different user was blocked', async () => {
      const { uploadId } = await service.initChunkUpload(
        { filename: 'owned.txt', totalChunks: 1, totalSize: 5, mimetype: 'text/plain' },
        'owner-1',
      );
      trackCleanup(path.join(uploadsDir, 'chunks', uploadId));

      await expect(service.saveChunkSlice(makeMulterFile({ content: 'hello' }), uploadId, 0, 'owner-1')).resolves.toBeDefined();
    });

    it('refuses to start a session when chunked upload is disabled in Settings', async () => {
      optionsService.getAllOptions.mockResolvedValue({ media_enable_chunked_upload: false });

      await expect(
        service.initChunkUpload({ filename: 'x.txt', totalChunks: 1, totalSize: 1, mimetype: 'text/plain' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects completion when a chunk is missing', async () => {
      const { uploadId } = await service.initChunkUpload(
        { filename: 'incomplete.txt', totalChunks: 2, totalSize: 11, mimetype: 'text/plain' },
        'user-1',
      );
      trackCleanup(path.join(uploadsDir, 'chunks', uploadId));

      await service.saveChunkSlice(makeMulterFile({ content: 'hello ' }), uploadId, 0, 'user-1');
      // chunk index 1 never uploaded

      await expect(service.completeChunkUpload(uploadId, 'user-1')).rejects.toThrow(BadRequestException);
    });
  });
});
