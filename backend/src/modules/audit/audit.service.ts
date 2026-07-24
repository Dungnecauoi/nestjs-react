import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { QueryAuditDto } from './dto/query-audit.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { I18nService } from 'nestjs-i18n';

export interface CreateAuditLogParams {
  userId?: string;
  userEmail?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  module: string;
  entityId?: string;
  beforeState?: any;
  afterState?: any;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Ghi log thao tác hệ thống và phát sinh Notification Event
   */
  async logAction(params: CreateAuditLogParams) {
    const {
      userId,
      userEmail,
      action,
      module,
      entityId,
      beforeState,
      afterState,
      ipAddress,
      userAgent,
    } = params;

    const auditLog = await this.prisma.auditLog.create({
      data: {
        userId: userId || null,
        userEmail: userEmail || 'System',
        action,
        module,
        entityId: entityId || null,
        beforeState: beforeState ? JSON.stringify(beforeState) : null,
        afterState: afterState ? JSON.stringify(afterState) : null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });

    // Phát sự kiện tới Notification System để thông báo cho Admin nếu là hành động quan trọng (bỏ qua auth refresh/login)
    if (
      (['CREATE', 'DELETE'].includes(action) || module === 'setting') &&
      module !== 'auth'
    ) {
      this.eventEmitter.emit('notification.send', {
        title: `Nhật ký thao tác: ${action} [${module}]`,
        content: `${userEmail || 'Hệ thống'} vừa thực hiện thao tác ${action} trên module ${module}`,
        type: action === 'DELETE' ? 'warning' : 'info',
        data: JSON.stringify({ auditLogId: auditLog.id, module, entityId }),
      });
    }

    return auditLog;
  }

  /**
   * Lấy danh sách Nhật Ký Thao Tác (Audit Logs) phân trang Server-side
   */
  async findAll(query: QueryAuditDto) {
    const {
      page = 1,
      limit = 10,
      search,
      module,
      action,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { userEmail: { contains: search } },
        { module: { contains: search } },
        { action: { contains: search } },
        { ipAddress: { contains: search } },
      ];
    }

    if (module) {
      where.module = module;
    }

    if (action) {
      where.action = action;
    }

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
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

  /**
   * Lấy thông tin chi tiết một bản ghi Audit Log (kèm Diff JSON)
   */
  async findOne(id: string, lang: string = 'vi') {
    const auditLog = await this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!auditLog) {
      throw new NotFoundException(this.i18n.t('audit.NOT_FOUND', { lang }));
    }

    return auditLog;
  }

  /**
   * Xóa 1 bản ghi Nhật ký
   */
  async remove(id: string, lang: string = 'vi') {
    const existing = await this.prisma.auditLog.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(this.i18n.t('audit.NOT_FOUND', { lang }));
    }

    return this.prisma.auditLog.delete({ where: { id } });
  }

  /**
   * Dọn dẹp toàn bộ log nhật ký hệ thống
   */
  async clearAll() {
    return this.prisma.auditLog.deleteMany({});
  }
}
