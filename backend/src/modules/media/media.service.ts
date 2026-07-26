import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { QueryMediaDto } from './dto/query-media.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

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
    // file đã được multer (StorageService.getMulterConfig) ghi an toàn vào ./uploads/<file.filename>
    const host = process.env.APP_URL || 'http://localhost:3000';
    const publicUrl = `${host}/uploads/${file.filename}`;

    return this.prisma.media.create({
      data: {
        filename: file.originalname,
        filepath: `/uploads/${file.filename}`,
        url: publicUrl,
        mimetype: file.mimetype,
        size: file.size,
        title: file.originalname,
        altText: file.originalname,
        createdById: createdById || null,
      },
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
    const existing = await this.findOne(id);

    // 1. Remove old physical file from disk
    const relativePath = existing.filepath.startsWith('/')
      ? existing.filepath.substring(1)
      : existing.filepath;
    const fullPath = path.join(process.cwd(), relativePath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (err) {
        console.error('Lỗi khi xóa file vật lý cũ:', err);
      }
    }

    // 2. File mới đã được multer (StorageService.getMulterConfig) ghi an toàn vào ./uploads/<file.filename>
    const host = process.env.APP_URL || 'http://localhost:3000';
    const publicUrl = `${host}/uploads/${file.filename}`;

    // 3. Update database record
    return this.prisma.media.update({
      where: { id },
      data: {
        filename: file.originalname,
        filepath: `/uploads/${file.filename}`,
        url: publicUrl,
        mimetype: file.mimetype,
        size: file.size,
      },
    });
  }

  async removeMedia(id: string) {
    await this.findOne(id);
    // Soft delete: giữ nguyên file vật lý trên đĩa để restore() vẫn dùng lại được.
    return this.prisma.media.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
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
