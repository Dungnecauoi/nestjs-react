import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import * as crypto from 'crypto';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class ApiKeyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  private hashKey(rawKey: string): string {
    return crypto.createHash('sha256').update(rawKey).digest('hex');
  }

  async create(dto: CreateApiKeyDto) {
    // Bắt buộc chọn permission cụ thể — không cho fallback wildcard '*' (tương đương
    // quyền super-admin), tránh phát hành nhầm "god-mode key" khi quên chọn scope.
    if (!dto.permissions || dto.permissions.length === 0) {
      throw new BadRequestException(
        'Vui lòng chọn ít nhất 1 quyền hạn cụ thể cho API Key. Không cho phép để trống (mặc định wildcard "*" đã bị loại bỏ vì lý do bảo mật).',
      );
    }

    const rawSecret = crypto.randomBytes(24).toString('hex');
    const fullRawKey = `ecx_live_${rawSecret}`;
    const prefix = fullRawKey.substring(0, 12);
    const keyHash = this.hashKey(fullRawKey);

    const permissionsJson = JSON.stringify(dto.permissions);

    const record = await this.prisma.apiKey.create({
      data: {
        name: dto.name,
        prefix,
        keyHash,
        permissions: permissionsJson,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });

    return {
      apiKey: record,
      rawSecretKey: fullRawKey,
      warning: 'Hãy sao chép Khóa Bí Mật này ngay lập tức. Bạn sẽ không thể xem lại nó lần thứ hai!',
    };
  }

  async findAll() {
    const keys = await this.prisma.apiKey.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return keys.map((k) => ({
      ...k,
      permissions: k.permissions ? JSON.parse(k.permissions) : [],
    }));
  }

  async validateKey(rawKey: string) {
    if (!rawKey || !rawKey.startsWith('ecx_live_')) {
      return null;
    }

    const keyHash = this.hashKey(rawKey);
    const apiKey = await this.prisma.apiKey.findFirst({
      where: {
        keyHash,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    if (!apiKey) {
      return null;
    }

    // Update last used timestamp asynchronously
    this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    }).catch(() => null);

    // Deny-by-default nếu record cũ (trước khi bỏ wildcard mặc định) không có permissions hợp lệ.
    const permissions = apiKey.permissions ? JSON.parse(apiKey.permissions) : [];

    return {
      isApiKey: true,
      id: apiKey.id,
      name: apiKey.name,
      roles: ['api-key'],
      permissions,
    };
  }

  async revoke(id: string) {
    const key = await this.prisma.apiKey.findUnique({ where: { id } });
    if (!key) {
      const lang = I18nContext.current()?.lang;
      throw new NotFoundException(this.i18n.t('messages.NOT_FOUND', { lang, args: { id } }));
    }

    return this.prisma.apiKey.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async restore(id: string) {
    const key = await this.prisma.apiKey.findUnique({ where: { id } });
    if (!key) {
      const lang = I18nContext.current()?.lang;
      throw new NotFoundException(this.i18n.t('messages.NOT_FOUND', { lang, args: { id } }));
    }

    return this.prisma.apiKey.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async delete(id: string) {
    const key = await this.prisma.apiKey.findUnique({ where: { id } });
    if (!key) {
      const lang = I18nContext.current()?.lang;
      throw new NotFoundException(this.i18n.t('messages.NOT_FOUND', { lang, args: { id } }));
    }

    await this.prisma.apiKey.delete({ where: { id } });
    const lang = I18nContext.current()?.lang;
    return { success: true, message: this.i18n.t('messages.DELETE_SUCCESS', { lang }) };
  }
}
