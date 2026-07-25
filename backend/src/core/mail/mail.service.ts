import { Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import * as nodemailer from 'nodemailer';
import { CustomLoggerService } from '../logger/logger.service';
import { MailConfigService } from './mail-config.service';

@Injectable()
export class MailService {
  private transporter?: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: CustomLoggerService,
    private readonly mailConfigService: MailConfigService,
    @Optional() @InjectQueue('mail') private readonly mailQueue?: Queue,
  ) {
    const mailer = this.configService.get<string>('mail.mailer');
    // Nếu có hàng đợi (QUEUE_CONNECTION=redis), việc gửi thật do MailProcessor đảm nhiệm,
    // MailService không cần tạo transporter riêng.
    if (mailer && mailer !== 'log' && !this.mailQueue) {
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
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    // Ưu tiên driver cấu hình qua giao diện Settings (lưu trong DB) nếu có.
    const resolved = await this.mailConfigService.getEffectiveDriver();
    if (resolved) {
      if (this.mailQueue) {
        await this.mailQueue.add('send-mail', { to, subject, html });
        return;
      }
      await resolved.driver.send({ to, subject, html, from: resolved.from });
      return;
    }

    // Chưa cấu hình driver qua UI -> fallback hành vi cũ dựa vào .env
    const mailer = this.configService.get<string>('mail.mailer');

    if (!mailer || mailer === 'log') {
      this.logger.log(
        `[MAIL_MAILER=log] To: ${to} | Subject: ${subject}\n${html}`,
        'MailService',
      );
      return;
    }

    if (this.mailQueue) {
      await this.mailQueue.add('send-mail', { to, subject, html });
      return;
    }

    const fromName = this.configService.get<string>('mail.fromName');
    const fromAddress = this.configService.get<string>('mail.fromAddress');

    await this.transporter!.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to,
      subject,
      html,
    });
  }
}
