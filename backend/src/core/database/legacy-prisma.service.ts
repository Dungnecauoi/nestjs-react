import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';

/**
 * Kết nối DB phụ (hệ thống Legacy) — hoàn toàn độc lập với `PrismaService` (DB chính).
 * Dùng client sinh riêng từ `prisma/legacy/schema.prisma` (xem file đó để biết cách setup),
 * KHÔNG phải @prisma/client mặc định.
 *
 * `require()` động (không static import) vì client này chỉ tồn tại SAU khi chạy
 * `npm run legacy:db:generate` — dự án không dùng tính năng này không bị bắt buộc phải có
 * module đó mới compile được. Chỉ throw lỗi rõ ràng lúc khởi tạo (module này chỉ được đăng ký
 * khi LEGACY_DATABASE_URL có set, xem legacy-database.module.ts), không ảnh hưởng dự án khác.
 *
 * Lưu ý: không JOIN được xuyên DB chính/DB legacy — muốn kết hợp dữ liệu phải tự query 2 lần
 * rồi ghép ở code (application-level join).
 */
@Injectable()
export class LegacyPrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(LegacyPrismaService.name);

  /** Client Prisma thật cho DB legacy — kiểu `any` vì generated tại build-time theo schema của từng dự án. */
  db: any;

  async onModuleInit() {
    let LegacyPrismaClient: any;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      ({ PrismaClient: LegacyPrismaClient } = require('.prisma/legacy-client'));
    } catch {
      throw new Error(
        'Chưa generate Legacy Prisma Client. Chạy "npm run legacy:db:generate" trước ' +
          '(cần LEGACY_DATABASE_URL đã set và schema đã introspect qua "npm run legacy:db:pull").',
      );
    }

    this.db = new LegacyPrismaClient();
    await this.db.$connect();
    this.logger.log('Đã kết nối Legacy Database');
  }

  async onModuleDestroy() {
    if (this.db) {
      await this.db.$disconnect();
    }
  }
}
