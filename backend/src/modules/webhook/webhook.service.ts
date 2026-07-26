import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import * as crypto from 'crypto';
import { CustomLoggerService } from '../../core/logger/logger.service';

@Injectable()
export class WebhookService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CustomLoggerService,
  ) {}

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
    if (!item) throw new NotFoundException('Webhook không tồn tại!');
    await this.prisma.webhook.delete({ where: { id } });
    return { success: true, message: 'Đã xóa Webhook endpoint thành công' };
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
    const bodyStr = JSON.stringify({
      id: crypto.randomUUID(),
      event,
      timestamp: new Date().toISOString(),
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
    if (!hook) throw new NotFoundException('Webhook không tồn tại!');

    await this.sendWebhookPayload(hook, 'webhook.ping', {
      message: 'Đây là tín hiệu kiểm tra kết nối Webhook từ Core ERP!',
      pingTime: new Date().toISOString(),
    });

    return { success: true, message: `Đã gửi tín hiệu Test Ping tới URL ${hook.url}` };
  }
}
