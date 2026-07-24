import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.media.findUnique({
      where: { id },
    });
    if (!item) {
      throw new NotFoundException(`Không tìm thấy tập tin media với ID: ${id}`);
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
    const item = await this.findOne(id);

    // Remove physical file from disk
    const relativePath = item.filepath.startsWith('/')
      ? item.filepath.substring(1)
      : item.filepath;
    const fullPath = path.join(process.cwd(), relativePath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (err) {
        console.error('Lỗi khi xóa file vật lý:', err);
      }
    }

    return this.prisma.media.delete({
      where: { id },
    });
  }
}
