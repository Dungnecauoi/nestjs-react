import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MailService } from './mail.service';
import { MailProcessor } from './mail.processor';
import { MailConfigService } from './mail-config.service';
import { GmailOAuthService } from './gmail-oauth.service';

// QUEUE_CONNECTION=redis mới bật hàng đợi thật (BullMQ cần Redis). Mặc định (sync) giữ nguyên
// hành vi gửi mail đồng bộ/log như cũ, không yêu cầu Redis phải chạy.
// Root connection (BullModule.forRootAsync) chỉ khai báo 1 lần duy nhất ở QueueModule
// (src/core/queue/queue.module.ts) — module này chỉ registerQueue tên riêng của mình.
const useQueue = process.env.QUEUE_CONNECTION === 'redis';

const queueImports = useQueue ? [BullModule.registerQueue({ name: 'mail' })] : [];

@Global()
@Module({
  imports: [...queueImports],
  providers: [
    MailService,
    MailConfigService,
    GmailOAuthService,
    ...(useQueue ? [MailProcessor] : []),
  ],
  exports: [MailService, MailConfigService, GmailOAuthService],
})
export class MailModule {}
