import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { NotificationGateway } from './notification.gateway';
import { OnEvent } from '@nestjs/event-emitter';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationGateway,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Tạo thông báo mới và phát trực tiếp qua WebSocket Gateway Realtime
   */
  async create(createDto: CreateNotificationDto, lang: string = 'vi') {
    const notification = await this.prisma.notification.create({
      data: {
        userId: createDto.userId || null,
        title: createDto.title,
        content: createDto.content,
        type: createDto.type || 'info',
        data: createDto.data || null,
      },
    });

    // Push realtime qua WebSocket
    this.gateway.sendNotificationToUser(notification.userId, notification);

    return notification;
  }

  /**
   * Lắng nghe sự kiện hệ thống toàn cục qua EventEmitter ('notification.send')
   */
  @OnEvent('notification.send')
  async handleSystemNotificationEvent(payload: CreateNotificationDto) {
    await this.create(payload);
  }

  /**
   * Lấy danh sách thông báo của User đăng nhập kèm phân trang và số lượng chưa đọc
   */
  async findAllForUser(userId: string, query: QueryNotificationDto) {
    const { page = 1, limit = 10, search, isRead, type, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        { userId: userId },
        { userId: null }, // Thông báo toàn hệ thống
      ],
    };

    if (search) {
      where.AND = [
        {
          OR: [
            { title: { contains: search } },
            { content: { contains: search } },
          ],
        },
      ];
    }

    if (isRead !== undefined && isRead !== '') {
      where.isRead = isRead === 'true';
    }

    if (type) {
      where.type = type;
    }

    const [items, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: {
          OR: [{ userId: userId }, { userId: null }],
          isRead: false,
        },
      }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        unreadCount,
      },
    };
  }

  /**
   * Đánh dấu 1 thông báo là đã đọc
   */
  async markAsRead(id: string, userId: string, lang: string = 'vi') {
    const existing = await this.prisma.notification.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(this.i18n.t('notification.NOT_FOUND', { lang }));
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Đánh dấu tất cả thông báo của User là đã đọc
   */
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        OR: [{ userId }, { userId: null }],
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Xóa thông báo
   */
  async remove(id: string, lang: string = 'vi') {
    const existing = await this.prisma.notification.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(this.i18n.t('notification.NOT_FOUND', { lang }));
    }

    return this.prisma.notification.delete({ where: { id } });
  }
}
