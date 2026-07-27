import { Injectable, Optional } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  constructor(
    // Queue 'mail' chỉ tồn tại khi QUEUE_CONNECTION=redis (xem MailModule). Optional để
    // /queues vẫn load được ở môi trường mặc định (không Redis) thay vì crash DI lúc boot.
    @Optional() @InjectQueue('mail') private readonly mailQueue?: Queue,
  ) {}

  async getQueueStats() {
    if (!this.mailQueue) {
      return {
        enabled: false,
        message: 'Hàng đợi chưa được bật. Đặt QUEUE_CONNECTION=redis để kích hoạt.',
        mailQueue: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0, total: 0 },
      };
    }

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.mailQueue.getWaitingCount(),
      this.mailQueue.getActiveCount(),
      this.mailQueue.getCompletedCount(),
      this.mailQueue.getFailedCount(),
      this.mailQueue.getDelayedCount(),
    ]);

    return {
      enabled: true,
      mailQueue: {
        waiting,
        active,
        completed,
        failed,
        delayed,
        total: waiting + active + completed + failed + delayed,
      },
    };
  }

  async cleanCompletedJobs() {
    if (!this.mailQueue) {
      return { success: false, message: 'Hàng đợi chưa được bật. Đặt QUEUE_CONNECTION=redis để kích hoạt.' };
    }
    await this.mailQueue.clean(0, 100, 'completed');
    return { success: true, message: 'Đã dọn dẹp các job hoàn thành trong hàng đợi mail' };
  }

  async cleanFailedJobs() {
    if (!this.mailQueue) {
      return { success: false, message: 'Hàng đợi chưa được bật. Đặt QUEUE_CONNECTION=redis để kích hoạt.' };
    }
    await this.mailQueue.clean(0, 100, 'failed');
    return { success: true, message: 'Đã dọn dẹp các job thất bại trong hàng đợi mail' };
  }
}
