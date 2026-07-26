import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SendMailJobData } from './processors/mail.processor';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('mail') private readonly mailQueue: Queue<SendMailJobData>,
  ) {}

  async addMailJob(data: SendMailJobData) {
    return this.mailQueue.add('send-email', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: 100,
      removeOnFail: 500,
    });
  }

  async getQueueStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.mailQueue.getWaitingCount(),
      this.mailQueue.getActiveCount(),
      this.mailQueue.getCompletedCount(),
      this.mailQueue.getFailedCount(),
      this.mailQueue.getDelayedCount(),
    ]);

    return {
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
    await this.mailQueue.clean(0, 100, 'completed');
    return { success: true, message: 'Đã dọn dẹp các job hoàn thành trong hàng đợi mail' };
  }

  async cleanFailedJobs() {
    await this.mailQueue.clean(0, 100, 'failed');
    return { success: true, message: 'Đã dọn dẹp các job thất bại trong hàng đợi mail' };
  }
}
