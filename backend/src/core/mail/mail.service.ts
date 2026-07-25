import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { CustomLoggerService } from '../logger/logger.service';

@Injectable()
export class MailService {
  private transporter?: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: CustomLoggerService,
  ) {
    const mailer = this.configService.get<string>('mail.mailer');
    if (mailer && mailer !== 'log') {
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
    const fromName = this.configService.get<string>('mail.fromName');
    const fromAddress = this.configService.get<string>('mail.fromAddress');

    if (!this.transporter) {
      this.logger.log(
        `[MAIL_MAILER=log] To: ${to} | Subject: ${subject}\n${html}`,
        'MailService',
      );
      return;
    }

    await this.transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to,
      subject,
      html,
    });
  }
}
