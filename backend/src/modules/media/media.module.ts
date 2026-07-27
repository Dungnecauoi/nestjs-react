import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { MediaProcessor } from './media.processor';

// QUEUE_CONNECTION=redis mới bật xử lý nền qua BullMQ (convert WebP/thumbnail video chạy
// worker riêng, không chặn response upload). Mặc định (không set) xử lý đồng bộ ngay trong
// request — xem MediaService.createMedia()/processMediaFile(). Root connection (forRootAsync)
// chỉ khai báo 1 lần ở QueueModule (src/core/queue/queue.module.ts) — module này chỉ
// registerQueue tên riêng của mình.
const useQueue = process.env.QUEUE_CONNECTION === 'redis';

const queueImports = useQueue
  ? [BullModule.registerQueue({ name: 'media-processing' })]
  : [];

@Module({
  imports: [...queueImports],
  controllers: [MediaController],
  providers: [MediaService, ...(useQueue ? [MediaProcessor] : [])],
  exports: [MediaService],
})
export class MediaModule {}
