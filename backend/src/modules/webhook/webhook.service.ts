import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import * as crypto from 'crypto';
import * as dns from 'dns';
import { CustomLoggerService } from '../../core/logger/logger.service';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { encrypt, decrypt } from '../../common/utils/crypto.util';

@Injectable()
export class WebhookService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CustomLoggerService,
    private readonly i18n: I18nService,
    private readonly configService: ConfigService,
  ) {}

  private get appKey(): string {
    return this.configService.get<string>('app.key') || 'default_secret_key';
  }

  /**
   * A2: SSRF Protection — chặn Webhook URL trỏ vào private/internal IPs.
   * Chỉ cho phép HTTPS, chặn: localhost, 127.x, 10.x, 172.16-31.x, 192.168.x, 169.254.x
   */
  private async validateWebhookUrl(url: string): Promise<void> {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new BadRequestException('Webhook URL không hợp lệ (URL malformed).');
    }

    if (parsed.protocol !== 'https:') {
      throw new BadRequestException('Webhook URL bắt buộc phải dùng HTTPS để đảm bảo bảo mật.');
    }

    const hostname = parsed.hostname.toLowerCase();

    // Chặn literal localhost / loopback
    if (hostname === 'localhost' || hostname === '0.0.0.0') {
      throw new BadRequestException('Webhook URL không được trỏ vào mạng nội bộ (localhost).');
    }

    // Kiểm tra nếu hostname là IPv6 loopback
    if (hostname === '::1' || hostname.startsWith('[')) {
      throw new BadRequestException('Webhook URL không được dùng IPv6 loopback.');
    }

    // Nếu là IP address literal, kiểm tra private ranges
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Regex.test(hostname)) {
      this.assertNotPrivateIp(hostname);
      return;
    }

    // Nếu là domain, resolve DNS rồi kiểm tra IP kết quả
    try {
      const addresses = await dns.promises.resolve4(hostname);
      for (const ip of addresses) {
        this.assertNotPrivateIp(ip);
      }
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(`Không thể resolve DNS cho hostname: ${hostname}`);
    }
  }

  private assertNotPrivateIp(ip: string): void {
    const parts = ip.split('.').map(Number);
    const [a, b] = parts;

    const isPrivate =
      a === 127 ||                                        // 127.0.0.0/8 loopback
      a === 10 ||                                         // 10.0.0.0/8
      (a === 172 && b >= 16 && b <= 31) ||               // 172.16.0.0/12
      (a === 192 && b === 168) ||                         // 192.168.0.0/16
      (a === 169 && b === 254) ||                         // 169.254.0.0/16 link-local (AWS metadata)
      (a === 100 && b >= 64 && b <= 127) ||              // 100.64.0.0/10 shared
      a === 0;                                            // 0.0.0.0/8

    if (isPrivate) {
      throw new BadRequestException(
        `Webhook URL không được trỏ vào mạng nội bộ (IP: ${ip}). SSRF Protection.`,
      );
    }
  }

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
    // A2: SSRF protection — validate URL trước khi lưu
    await this.validateWebhookUrl(dto.url);

    // Secret luôn server-generate — không cho client tự đặt (tránh secret yếu/đoán được
    // dùng để ký HMAC), mã hoá trước khi lưu DB (giống pattern crypto.util.ts của mail driver).
    const rawSecret = crypto.randomBytes(24).toString('hex');
    const record = await this.prisma.webhook.create({
      data: {
        name: dto.name,
        url: dto.url,
        secret: encrypt(rawSecret, this.appKey),
        events: JSON.stringify(dto.events),
      },
    });
    return {
      ...record,
      secret: rawSecret,
      warning: 'Hãy sao chép Secret này ngay — dùng để xác thực chữ ký HMAC phía nhận Webhook. Sẽ không hiển thị lại lần thứ hai.',
      events: JSON.parse(record.events),
    };
  }

  async update(id: string, dto: UpdateWebhookDto) {
    const existing = await this.prisma.webhook.findUnique({ where: { id } });
    if (!existing) {
      const lang = I18nContext.current()?.lang;
      throw new NotFoundException(this.i18n.t('messages.NOT_FOUND', { lang, args: { id } }));
    }

    if (dto.url && dto.url !== existing.url) {
      await this.validateWebhookUrl(dto.url);
    }

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.url !== undefined) data.url = dto.url;
    if (dto.events !== undefined) data.events = JSON.stringify(dto.events);
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    const updated = await this.prisma.webhook.update({
      where: { id },
      data,
    });

    return {
      ...updated,
      hasSecret: !!updated.secret,
      events: updated.events ? JSON.parse(updated.events) : [],
    };
  }

  async findAll() {
    const webhooks = await this.prisma.webhook.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return webhooks.map(({ secret, ...w }) => ({
      ...w,
      hasSecret: !!secret,
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
    // A2: re-validate URL ngay lúc gửi thật (không chỉ lúc create) — chặn DNS-rebinding SSRF
    // (domain resolve ra IP public lúc đăng ký, đổi sang IP nội bộ trước lúc webhook thật sự bắn).
    try {
      await this.validateWebhookUrl(hook.url);
    } catch (err: any) {
      this.logger.error(`Webhook ${hook.id} bị chặn lúc gửi (SSRF check thất bại): ${err.message}`, '', 'WebhookService');
      return;
    }

    const timestamp = new Date().toISOString();
    const bodyStr = JSON.stringify({
      id: crypto.randomUUID(),
      event,
      timestamp,
      data: payload,
    });

    const rawSecret = hook.secret ? decrypt(hook.secret, this.appKey) : '';
    const signature = rawSecret
      ? crypto.createHmac('sha256', rawSecret).update(bodyStr).digest('hex')
      : '';

    try {
      const res = await fetch(hook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'EcomCX-ERP-Webhook/1.0',
          'x-webhook-event': event,
          'x-webhook-timestamp': timestamp,
          'x-webhook-signature': signature,
        },
        body: bodyStr,
        signal: AbortSignal.timeout(10000), // SEC-02: 10s timeout preventing DoS/event-loop hangs
      });

      if (!res.ok) {
        this.logger.warn(
          `Webhook ${hook.id} (${hook.url}) returned non-2xx HTTP status: ${res.status} ${res.statusText}`,
          'WebhookService',
        );
      }

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
