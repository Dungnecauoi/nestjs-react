import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../core/database/prisma.service';
import { QueryAuditDto } from './dto/query-audit.dto';
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
    private readonly i18n: I18nService,
  ) {}

  /**
   * Ghi log thao tác hệ thống — chỉ là nhật ký tra cứu (trang Audit Logs), KHÔNG tạo
   * Notification. Trước đây mọi CREATE/DELETE (kể cả upload ảnh, tạo webhook...) tự bắn
   * thông báo broadcast cho toàn bộ user đang online — gây spam. Module nào cần thông báo
   * thật (vd xoá user, đổi quyền) nên tự gọi NotificationService trực tiếp tại đúng chỗ đó,
   * không gắn chung vào audit log.
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

    return this.prisma.auditLog.create({
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
   * Dọn dẹp Nhật ký thao tác hệ thống cũ hơn 90 ngày vào 4:00 AM mỗi ngày
   */
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async cleanupOldAuditLogs() {
    const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    await this.prisma.auditLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });
  }
}
