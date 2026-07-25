import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { MailProcessor } from './mail.processor';

// QUEUE_CONNECTION=redis mới bật hàng đợi thật (BullMQ cần Redis). Mặc định (sync) giữ nguyên
// hành vi gửi mail đồng bộ/log như cũ, không yêu cầu Redis phải chạy.
const useQueue = process.env.QUEUE_CONNECTION === 'redis';

const queueImports = useQueue
  ? [
      BullModule.forRootAsync({
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          connection: {
            host: config.get<string>('cache.redisHost'),
            port: config.get<number>('cache.redisPort'),
            password: config.get<string>('cache.redisPassword'),
          },
        }),
      }),
      BullModule.registerQueue({ name: 'mail' }),
    ]
  : [];

@Global()
@Module({
  imports: [...queueImports],
  providers: [MailService, ...(useQueue ? [MailProcessor] : [])],
  exports: [MailService],
})
export class MailModule {}
