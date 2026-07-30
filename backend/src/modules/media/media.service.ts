import { Injectable, NotFoundException, BadRequestException, Optional } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { PrismaService } from '../../core/database/prisma.service';
import { QueryMediaDto } from './dto/query-media.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { WebhookService } from '../webhook/webhook.service';
import { OptionsService } from '../../core/options/options.service';
import { StorageConfigService } from '../../core/storage/storage-config.service';
import type { MediaProcessingJobData } from './media.processor';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Mặc định khi Settings chưa từng lưu (khớp hành vi cũ cho ảnh; video mở theo mặc định hợp lý
// vì trước đây bị chặn hoàn toàn không có admin nào bật được).
const DEFAULT_ALLOWED_IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const DEFAULT_MAX_IMAGE_SIZE_MB = 10;
const DEFAULT_ALLOWED_VIDEO_TYPES = ['mp4', 'webm', 'mov', 'mkv'];
const DEFAULT_MAX_VIDEO_SIZE_MB = 100;

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
    private readonly webhookService: WebhookService,
    private readonly optionsService: OptionsService,
    private readonly storageConfigService: StorageConfigService,
    // Queue 'media-processing' chỉ tồn tại khi QUEUE_CONNECTION=redis (xem MediaModule).
    // Không có thì xử lý đồng bộ ngay trong request (mặc định, zero infra).
    @Optional() @InjectQueue('media-processing') private readonly mediaQueue?: Queue<MediaProcessingJobData>,
  ) {}

  // Giới hạn THẬT theo Settings (allowedImageTypes/maxImageSizeMb/allowedVideoTypes/
  // maxVideoSizeMb) — multer chỉ chặn theo lưới an toàn tĩnh (StorageService), giới hạn admin
  // cấu hình được enforce ở đây, đọc sống mỗi request nên đổi Settings có hiệu lực ngay.
  private async enforceUploadLimits(file: Express.Multer.File): Promise<void> {
    const isVideo = file.mimetype.startsWith('video/');
    const isImage = file.mimetype.startsWith('image/');
    if (!isVideo && !isImage) return; // pdf/docx/xlsx: chưa có giới hạn cấu hình riêng

    const options = await this.optionsService.getAllOptions();
    const allowedTypes: string[] = isVideo
      ? options.allowedVideoTypes?.length
        ? options.allowedVideoTypes
        : DEFAULT_ALLOWED_VIDEO_TYPES
      : options.allowedImageTypes?.length
        ? options.allowedImageTypes
        : DEFAULT_ALLOWED_IMAGE_TYPES;
    const maxSizeMb: number = isVideo
      ? options.maxVideoSizeMb || DEFAULT_MAX_VIDEO_SIZE_MB
      : options.maxImageSizeMb || DEFAULT_MAX_IMAGE_SIZE_MB;

    let ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (ext === 'jpeg') ext = 'jpg'; // Settings chỉ có 1 tuỳ chọn 'JPG / JPEG' dùng chung

    const normalizedAllowed = allowedTypes.map((t) => t.toLowerCase());
    const extAllowed = normalizedAllowed.includes(ext);
    const sizeAllowed = file.size <= maxSizeMb * 1024 * 1024;

    if (!extAllowed || !sizeAllowed) {
      this.deleteTempFile(file);
      const kind = isVideo ? 'video' : 'ảnh';
      const message = !extAllowed
        ? `Định dạng .${ext} không được phép theo cấu hình hệ thống (chỉ chấp nhận: ${allowedTypes.join(', ')})`
        : `Kích thước ${kind} vượt quá giới hạn cho phép (${maxSizeMb}MB) theo cấu hình hệ thống`;
      throw new BadRequestException(message);
    }
  }

  private deleteTempFile(file: Express.Multer.File): void {
    try {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch {
      // best-effort, không chặn luồng báo lỗi chính
    }
  }

  async findAll(query: QueryMediaDto = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      mimetype,
      disk,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { filename: { contains: search } },
        { title: { contains: search } },
        { altText: { contains: search } },
      ];
    }

    if (mimetype) {
      where.mimetype = { contains: mimetype };
    }

    if (disk) {
      where.disk = disk;
    }

    const [items, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.media.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.media.findUnique({
      where: { id, deletedAt: null },
    });
    if (!item) {
      const lang = I18nContext.current()?.lang;
      throw new NotFoundException(
        this.i18n.t('messages.NOT_FOUND', { lang, args: { id } }),
      );
    }
    return item;
  }

  async createMedia(file: Express.Multer.File, createdById?: string) {
    await this.enforceUploadLimits(file);
    const options = await this.optionsService.getAllOptions();

    // 1. DEDUPLICATION VIA SHA-256 (Tùy chỉnh bật/tắt qua Option `media_enable_sha256_deduplication`)
    const enableDeduplication = options.media_enable_sha256_deduplication ?? true;
    let fileHash: string | undefined;
    if (enableDeduplication && file.path && fs.existsSync(file.path)) {
      const buffer = fs.readFileSync(file.path);
      fileHash = crypto.createHash('sha256').update(buffer).digest('hex');
      const existingMedia = await this.prisma.media.findFirst({
        where: { hash: fileHash, deletedAt: null },
      });
      if (existingMedia) {
        this.deleteTempFile(file);
        return existingMedia; // Tái sử dụng Media tệp trùng lặp
      }
    }

    // File đã được multer ghi tạm ra ./uploads/<file.filename>; driver quyết định nơi lưu
    // CHÍNH THỨC (Local: giữ nguyên tại đó; S3: stream lên bucket rồi xoá file tạm local).
    const { driver, disk } = await this.storageConfigService.getEffectiveDriver();
    const result = await driver.upload(file, 'uploads');

    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');
    const needsProcessing = (isImage && (!!options.convertToWebp || !!options.media_auto_webp_conversion)) || isVideo;

    const created = await this.prisma.media.create({
      data: {
        filename: file.originalname,
        filepath: result.path,
        url: result.url,
        mimetype: file.mimetype,
        size: file.size,
        disk,
        hash: fileHash || null,
        title: file.originalname,
        altText: file.originalname,
        createdById: createdById || null,
        processingStatus: needsProcessing ? 'pending' : 'completed',
      },
    });

    let finalMedia = created;
    if (needsProcessing) {
      if (this.mediaQueue) {
        // Có Redis: enqueue, không chặn response — worker xử lý nền (xem MediaProcessor).
        this.mediaQueue.add('process', { mediaId: created.id }).catch(() => {});
      } else {
        // Không có Redis (mặc định): xử lý đồng bộ ngay, đúng tinh thần "sync fallback".
        // `created` là snapshot TRƯỚC khi xử lý — phải đọc lại để trả về processingStatus/
        // thumbnailUrl mới nhất, không phải object cũ đã lỗi thời.
        await this.processMediaFile(created.id);
        finalMedia = (await this.prisma.media.findUnique({ where: { id: created.id } })) ?? created;
      }
    }

    this.webhookService.triggerWebhooks('media.uploaded', finalMedia).catch(() => {});
    return finalMedia;
  }

  /**
   * Convert ảnh sang WebP (nếu bật convertToWebp) hoặc tạo thumbnail cho video. Dùng chung
   * cho cả 2 đường: MediaProcessor (khi có Redis) và createMedia() gọi trực tiếp (sync fallback)
   * — tránh viết logic 2 lần. Hiện chỉ xử lý được file lưu trên Local disk; file trên S3 được
   * bỏ qua bước xử lý (giữ nguyên, không lỗi) — nâng cấp sau nếu cần.
   */
  async processMediaFile(mediaId: string): Promise<void> {
    const media = await this.prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) return;

    try {
      await this.prisma.media.update({
        where: { id: mediaId },
        data: { processingStatus: 'processing' },
      });

      let thumbnailUrl: string | undefined;
      const isImage = media.mimetype.startsWith('image/');
      const isVideo = media.mimetype.startsWith('video/');

      if (media.disk === 'local') {
        if (isImage) {
          thumbnailUrl = await this.convertImageToWebp(media.filepath);
        } else if (isVideo) {
          thumbnailUrl = await this.generateVideoThumbnail(media.filepath);
        }
      }

      await this.prisma.media.update({
        where: { id: mediaId },
        data: {
          processingStatus: 'completed',
          ...(thumbnailUrl && { thumbnailUrl }),
        },
      });
    } catch (err) {
      console.error(`Lỗi xử lý media nền (ID: ${mediaId}):`, err);
      await this.prisma.media
        .update({ where: { id: mediaId }, data: { processingStatus: 'failed' } })
        .catch(() => {});
      throw err; // để BullMQ retry khi chạy qua queue
    }
  }

  private async convertImageToWebp(filepath: string): Promise<string | undefined> {
    const inputPath = path.join(process.cwd(), filepath.replace(/^\//, ''));
    if (!fs.existsSync(inputPath)) return undefined;

    const options = await this.optionsService.getAllOptions();
    const quality = options.media_compression_quality ? Number(options.media_compression_quality) : 80;
    const stripExif = options.media_strip_exif_metadata ?? true;

    const outputFilename = `webp-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
    const outputPath = path.join(process.cwd(), 'uploads', outputFilename);

    let sharpInstance = sharp(inputPath);
    if (!stripExif) {
      sharpInstance = sharpInstance.withMetadata();
    }
    await sharpInstance.webp({ quality }).toFile(outputPath);

    const host = process.env.APP_URL || 'http://localhost:3000';
    return `${host}/uploads/${outputFilename}`;
  }

  private async generateVideoThumbnail(filepath: string): Promise<string | undefined> {
    const inputPath = path.join(process.cwd(), filepath.replace(/^\//, ''));
    if (!fs.existsSync(inputPath)) return undefined;

    const outputFilename = `thumb-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
    const outputDir = path.join(process.cwd(), 'uploads');

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .screenshots({
          timestamps: ['1'],
          filename: outputFilename,
          folder: outputDir,
          size: '320x?',
        })
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(err));
    });

    const host = process.env.APP_URL || 'http://localhost:3000';
    return `${host}/uploads/${outputFilename}`;
  }

  // Gán 1 media cho 1 entity bất kỳ (User avatar, Department logo...) — helper dùng chung
  // thay cho việc mỗi module tự thêm cột ảnh riêng. Qua bảng pivot `MediaAttachment` (không
  // nhúng thẳng trên Media) nên 1 media dùng chung được ở NHIỀU nơi cùng lúc — đúng tinh thần
  // thư viện media dùng chung (gán ảnh A vào bài viết X không làm mất khả năng dùng ảnh A ở
  // bài viết Y hay làm avatar). `collection` phân biệt nhiều vai trò trên cùng 1 entity
  // (vd 'avatar' vs 'gallery').
  async attachTo(
    mediaId: string,
    attachableType: string,
    attachableId: string,
    collection = 'default',
  ) {
    await this.findOne(mediaId);
    return this.prisma.mediaAttachment.create({
      data: { mediaId, attachableType, attachableId, collection },
    });
  }

  async getAttached(attachableType: string, attachableId: string, collection?: string) {
    const attachments = await this.prisma.mediaAttachment.findMany({
      where: {
        attachableType,
        attachableId,
        ...(collection && { collection }),
      },
      include: { media: true },
      orderBy: { createdAt: 'desc' },
    });
    return attachments
      .filter((a) => !a.media.deletedAt)
      .map((a) => ({ ...a.media, attachmentId: a.id, collection: a.collection }));
  }

  // Gỡ 1 lượt gán cụ thể (không xoá Media — media vẫn còn để dùng chỗ khác). Gỡ theo
  // (attachableType, attachableId, collection) — dùng khi 1 entity chỉ được có tối đa 1 media
  // hiện hành trong 1 collection (vd avatar: đổi ảnh mới thì gỡ ảnh cũ khỏi collection 'avatar'
  // của đúng user đó, không đụng tới media/attachment ở nơi khác).
  async detach(attachableType: string, attachableId: string, collection = 'default') {
    return this.prisma.mediaAttachment.deleteMany({
      where: { attachableType, attachableId, collection },
    });
  }

  async updateMedia(
    id: string,
    dto: {
      title?: string;
      altText?: string;
      caption?: string;
      description?: string;
    },
  ) {
    await this.findOne(id);
    return this.prisma.media.update({
      where: { id },
      data: dto,
    });
  }

  async replaceMediaFile(id: string, file: Express.Multer.File) {
    await this.enforceUploadLimits(file);
    const existing = await this.findOne(id);

    // 1. Xoá file cũ theo ĐÚNG driver đã lưu nó (disk lưu trên chính dòng Media) — không phải
    // driver đang cấu hình hiện tại, tránh vỡ file cũ khi admin đổi driver giữa chừng.
    const oldDriver = await this.storageConfigService.getDriverForDisk(existing.disk);
    try {
      await oldDriver.delete(existing.filepath);
    } catch (err) {
      console.error('Lỗi khi xóa file vật lý cũ:', err);
    }

    // 2. Upload file mới theo driver đang cấu hình hiện tại
    const { driver, disk } = await this.storageConfigService.getEffectiveDriver();
    const result = await driver.upload(file, 'uploads');

    // 3. Update database record
    return this.prisma.media.update({
      where: { id },
      data: {
        filename: file.originalname,
        filepath: result.path,
        url: result.url,
        mimetype: file.mimetype,
        size: file.size,
        disk,
      },
    });
  }

  async removeMedia(id: string) {
    await this.findOne(id);
    // Soft delete: giữ nguyên file vật lý trên đĩa để restore() vẫn dùng lại được.
    const removed = await this.prisma.media.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    this.webhookService.triggerWebhooks('media.deleted', { id }).catch(() => {});
    return removed;
  }

  async restore(id: string) {
    const item = await this.prisma.media.findUnique({ where: { id } });
    if (!item || !item.deletedAt) {
      throw new NotFoundException(`Không tìm thấy tập tin media đã xóa với ID: ${id}`);
    }
    return this.prisma.media.update({
      where: { id },
      data: { deletedAt: null },
    });
  }
}
