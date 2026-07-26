import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import * as crypto from 'crypto';
import { CustomLoggerService } from '../../core/logger/logger.service';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class WebhookService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CustomLoggerService,
    private readonly i18n: I18nService,
  ) {}

  getAvailableEvents() {
    return [
      {
        module: 'System & Global',
        events: [
          { value: '*', label: 'Tất cả các sự kiện (*)' },
          { value: 'system.maintenance', label: 'Bật/tắt bảo trì (system.maintenance)' },
        ],
      },
      {
        module: 'Quản Lý Người Dùng (User)',
        events: [
          { value: 'user.created', label: 'Tạo tài khoản mới (user.created)' },
          { value: 'user.updated', label: 'Cập nhật người dùng (user.updated)' },
          { value: 'user.deleted', label: 'Xóa người dùng (user.deleted)' },
          { value: 'user.approved', label: 'Phê duyệt người dùng (user.approved)' },
        ],
      },
      {
        module: 'Quản Lý Vai Trò (Role)',
        events: [
          { value: 'role.created', label: 'Tạo vai trò mới (role.created)' },
          { value: 'role.updated', label: 'Cập nhật vai trò (role.updated)' },
          { value: 'role.deleted', label: 'Xóa vai trò (role.deleted)' },
        ],
      },
      {
        module: 'Quản Lý Phòng Ban (Department)',
        events: [
          { value: 'department.created', label: 'Tạo phòng ban (department.created)' },
          { value: 'department.updated', label: 'Cập nhật phòng ban (department.updated)' },
          { value: 'department.deleted', label: 'Xóa phòng ban (department.deleted)' },
        ],
      },
      {
        module: 'Quản Lý Media & Files',
        events: [
          { value: 'media.uploaded', label: 'Tải lên tập tin mới (media.uploaded)' },
          { value: 'media.deleted', label: 'Xóa tập tin (media.deleted)' },
        ],
      },
    ];
  }

  async create(dto: CreateWebhookDto) {
    const secret = dto.secret || crypto.randomBytes(24).toString('hex');
    const record = await this.prisma.webhook.create({
      data: {
        name: dto.name,
        url: dto.url,
        secret,
        events: JSON.stringify(dto.events),
      },
    });
    return {
      ...record,
      events: JSON.parse(record.events),
    };
  }

  async findAll() {
    const webhooks = await this.prisma.webhook.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return webhooks.map((w) => ({
      ...w,
      events: w.events ? JSON.parse(w.events) : [],
    }));
  }

  async delete(id: string) {
    const item = await this.prisma.webhook.findUnique({ where: { id } });
    if (!item) {
      const lang = I18nContext.current()?.lang;
      throw new NotFoundException(this.i18n.t('messages.NOT_FOUND', { lang, args: { id } }));
    }
    await this.prisma.webhook.delete({ where: { id } });
    const lang = I18nContext.current()?.lang;
    return { success: true, message: this.i18n.t('messages.DELETE_SUCCESS', { lang }) };
  }

  async triggerWebhooks(event: string, payload: any) {
    const webhooks = await this.prisma.webhook.findMany({
      where: { isActive: true },
    });

    const matching = webhooks.filter((w) => {
      try {
        const events: string[] = w.events ? JSON.parse(w.events) : [];
        return events.includes('*') || events.includes(event);
      } catch {
        return false;
      }
    });

    for (const hook of matching) {
      this.sendWebhookPayload(hook, event, payload).catch((err) => {
        this.logger.error(`Failed to send webhook ${hook.id} to ${hook.url}: ${err.message}`, err.stack, 'WebhookService');
      });
    }
  }

  private async sendWebhookPayload(hook: any, event: string, payload: any) {
    const timestamp = new Date().toISOString();
    const bodyStr = JSON.stringify({
      id: crypto.randomUUID(),
      event,
      timestamp,
      data: payload,
    });

    const signature = hook.secret
      ? crypto.createHmac('sha256', hook.secret).update(bodyStr).digest('hex')
      : '';

    try {
      await fetch(hook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'EcomCX-ERP-Webhook/1.0',
          'x-webhook-event': event,
          'x-webhook-timestamp': timestamp,
          'x-webhook-signature': signature,
        },
        body: bodyStr,
      });

      await this.prisma.webhook.update({
        where: { id: hook.id },
        data: { lastTriggeredAt: new Date() },
      });
    } catch (err: any) {
      this.logger.error(`HTTP error delivering webhook to ${hook.url}: ${err.message}`, '', 'WebhookService');
    }
  }

  async testPing(id: string) {
    const hook = await this.prisma.webhook.findUnique({ where: { id } });
    if (!hook) {
      const lang = I18nContext.current()?.lang;
      throw new NotFoundException(this.i18n.t('messages.NOT_FOUND', { lang, args: { id } }));
    }

    await this.sendWebhookPayload(hook, 'webhook.ping', {
      message: 'Đây là tín hiệu kiểm tra kết nối Webhook từ Core ERP!',
      pingTime: new Date().toISOString(),
    });

    return { success: true, message: `Đã gửi tín hiệu Test Ping tới URL ${hook.url}` };
  }
}
