import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/database/prisma.service';
import { CustomLoggerService } from '../src/core/logger/logger.service';
import { HttpExceptionFilter } from '../src/core/exceptions/http-exception.filter';

// 1x1 pixel JPEG — nhỏ nhất có thể để sharp xử lý WebP convert thành công trong flow thật.
const TINY_JPEG_BASE64 =
  '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

// Chunk-upload test dùng buffer RIÊNG (thêm trailer sau EOF marker của JPEG, sharp/libvips vẫn
// decode bình thường) — nếu dùng chung byte với test upload trực tiếp, SHA-256 trùng nhau sẽ
// kích hoạt dedup và trả về record CŨ thay vì tạo record mới, làm sai lệch assertion.
const CHUNKED_JPEG_BUFFER = Buffer.concat([
  Buffer.from(TINY_JPEG_BASE64, 'base64'),
  Buffer.from('e2e-chunked-uniqueness-marker'),
]);

describe('Media (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
  const createdMedia: Array<{ id: string; filepath?: string; thumbnailUrl?: string }> = [];
  const createdChunkDirs: string[] = [];

  // thumbnailUrl là URL đầy đủ (http://host/uploads/xxx.webp) — quy đổi lại thành đường dẫn
  // vật lý trên đĩa để dọn dẹp cùng lúc với file gốc.
  const localPathFromUrl = (url: string): string | null => {
    const match = url.match(/\/uploads\/(.+)$/);
    return match ? path.join(process.cwd(), 'uploads', match[1]) : null;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // main.ts áp global prefix + ValidationPipe theo cách imperative (không qua module metadata)
    // nên TestingModule không tự có — phải khai lại thủ công để test khớp hành vi thật khi chạy.
    app.setGlobalPrefix('api', { exclude: ['health'] });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter(app.get(CustomLoggerService)));
    await app.init();

    prisma = app.get(PrismaService);

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@ecomcx.com', password: '123456' });
    accessToken = loginRes.body?.data?.accessToken;
    if (!accessToken) {
      throw new Error('Seed admin login failed — cannot run media e2e tests without a valid token.');
    }
  });

  afterAll(async () => {
    for (const media of createdMedia) {
      try {
        await prisma.media.deleteMany({ where: { id: media.id } });
      } catch {
        // best-effort
      }
      if (media.filepath) {
        try {
          fs.rmSync(path.join(process.cwd(), media.filepath.replace(/^\//, '')), { force: true });
        } catch {
          // best-effort
        }
      }
      const thumbPath = media.thumbnailUrl && localPathFromUrl(media.thumbnailUrl);
      if (thumbPath) {
        try {
          fs.rmSync(thumbPath, { force: true });
        } catch {
          // best-effort
        }
      }
    }
    for (const dir of createdChunkDirs) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
      } catch {
        // best-effort
      }
    }
    await app.close();
  });

  it('rejects unauthenticated requests to the media list', async () => {
    await request(app.getHttpServer()).get('/api/media').expect(401);
  });

  it('uploads a file via multipart and returns the created media record', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/media/upload')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', Buffer.from(TINY_JPEG_BASE64, 'base64'), 'e2e-test.jpg')
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.mimetype).toBe('image/jpeg');
    expect(res.body.data.deduplicated).toBe(false);
    createdMedia.push(res.body.data);
  });

  it('rejects a chunk-init request missing required fields (DTO validation is actually wired up)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/media/upload-chunk/init')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ filename: 'test.txt' })
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  it('rejects a chunk upload whose uploadId does not match the server-generated pattern', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/media/upload-chunk/chunk')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('uploadId', '../../../etc/passwd')
      .field('chunkIndex', '0')
      .attach('chunk', Buffer.from(TINY_JPEG_BASE64, 'base64'), 'chunk_0.jpg')
      .expect(400);

    expect(res.body.message).toContain('uploadId không hợp lệ');
  });

  it('completes a real init -> chunk -> complete flow end-to-end', async () => {
    const fileBuffer = CHUNKED_JPEG_BUFFER;

    const initRes = await request(app.getHttpServer())
      .post('/api/media/upload-chunk/init')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ filename: 'e2e-chunked.jpg', totalChunks: 1, totalSize: fileBuffer.length, mimetype: 'image/jpeg' })
      .expect(201);

    const { uploadId } = initRes.body.data;
    createdChunkDirs.push(path.join(process.cwd(), 'uploads', 'chunks', uploadId));

    await request(app.getHttpServer())
      .post('/api/media/upload-chunk/chunk')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('uploadId', uploadId)
      .field('chunkIndex', '0')
      .attach('chunk', fileBuffer, 'chunk_0.jpg')
      .expect(201);

    const completeRes = await request(app.getHttpServer())
      .post('/api/media/upload-chunk/complete')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ uploadId })
      .expect(201);

    expect(completeRes.body.data.filename).toBe('e2e-chunked.jpg');
    expect(completeRes.body.data.createdById).toBeTruthy();
    createdMedia.push(completeRes.body.data);
  });
});
