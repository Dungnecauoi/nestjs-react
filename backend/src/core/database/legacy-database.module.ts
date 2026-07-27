import { Global, Module } from '@nestjs/common';
import { LegacyPrismaService } from './legacy-prisma.service';

// Chỉ đăng ký LegacyPrismaService khi LEGACY_DATABASE_URL có set — dự án không cần tích hợp
// hệ thống Legacy thì không có kết nối thừa, không bắt buộc phải generate client legacy.
// Đúng pattern zero-infra-mặc-định đã dùng cho Redis Queue/Cache/Broadcast trong core này.
const useLegacyDb = !!process.env.LEGACY_DATABASE_URL;

@Global()
@Module({
  providers: useLegacyDb ? [LegacyPrismaService] : [],
  exports: useLegacyDb ? [LegacyPrismaService] : [],
})
export class LegacyDatabaseModule {}
