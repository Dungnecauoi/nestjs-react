import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import * as nodemailer from 'nodemailer';
import { CustomLoggerService } from '../logger/logger.service';
import { MailConfigService } from './mail-config.service';

interface MailJobData {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
@Processor('mail')
export class MailProcessor extends WorkerHost {
  private readonly transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: CustomLoggerService,
    private readonly mailConfigService: MailConfigService,
  ) {
    super();
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('mail.host'),
      port: this.configService.get<number>('mail.port'),
      auth: this.configService.get<string>('mail.username')
        ? {
            user: this.configService.get<string>('mail.username'),
            pass: this.configService.get<string>('mail.password'),
          }
        : undefined,
    });
  }

  async process(job: Job<MailJobData>): Promise<void> {
    // Ưu tiên driver cấu hình qua UI (DB) nếu có, giữ transporter .env làm fallback
    const resolved = await this.mailConfigService.getEffectiveDriver();
    if (resolved) {
      await resolved.driver.send({
        to: job.data.to,
        subject: job.data.subject,
        html: job.data.html,
        from: resolved.from,
      });
      this.logger.log(`Đã gửi mail tới ${job.data.to} (job ${job.id})`, 'MailProcessor');
      return;
    }

    const fromName = this.configService.get<string>('mail.fromName');
    const fromAddress = this.configService.get<string>('mail.fromAddress');

    await this.transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: job.data.to,
      subject: job.data.subject,
      html: job.data.html,
    });

    this.logger.log(`Đã gửi mail tới ${job.data.to} (job ${job.id})`, 'MailProcessor');
  }
}
