import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';

// Nơi DUY NHẤT gọi BullModule.forRootAsync() (kết nối Redis dùng chung cho mọi queue trong
// app — 'mail', 'media-processing'...). Các module tính năng khác chỉ BullModule.registerQueue()
// tên riêng của mình, KHÔNG tự forRootAsync lần nữa (tránh đăng ký root trùng/xung đột).
// Chỉ bật khi QUEUE_CONNECTION=redis — mặc định (không set) không cố kết nối Redis, giữ đúng
// cam kết "zero infra by default" của toàn bộ hệ thống queue.
const useQueue = process.env.QUEUE_CONNECTION === 'redis';

const queueImports = useQueue
  ? [
      BullModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          connection: {
            host: config.get<string>('cache.redisHost'),
            port: config.get<number>('cache.redisPort'),
            password: config.get<string>('cache.redisPassword'),
            enableOfflineQueue: false,
            maxRetriesPerRequest: null,
          },
        }),
      }),
    ]
  : [];

@Global()
@Module({
  imports: [...queueImports],
  controllers: [QueueController],
  providers: [QueueService],
  exports: useQueue ? [BullModule] : [],
})
export class QueueModule {}
