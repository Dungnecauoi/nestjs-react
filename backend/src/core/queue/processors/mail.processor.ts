import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from '../../mail/mail.service';
import { CustomLoggerService } from '../../logger/logger.service';

export interface SendMailJobData {
  to: string;
  subject: string;
  content: string;
}

@Processor('mail')
export class MailProcessor extends WorkerHost {
  constructor(
    private readonly mailService: MailService,
    private readonly logger: CustomLoggerService,
  ) {
    super();
  }

  async process(job: Job<SendMailJobData, any, string>): Promise<any> {
    this.logger.log(`[MailProcessor] Processing mail job ID: ${job.id} to: ${job.data.to}`, 'MailProcessor');
    try {
      const result = await this.mailService.send(job.data.to, job.data.subject, job.data.content);
      this.logger.log(`[MailProcessor] Successfully sent email to ${job.data.to}`, 'MailProcessor');
      return result;
    } catch (err: any) {
      this.logger.error(`[MailProcessor] Failed to send email to ${job.data.to}: ${err.message}`, err.stack, 'MailProcessor');
      throw err;
    }
  }
}
