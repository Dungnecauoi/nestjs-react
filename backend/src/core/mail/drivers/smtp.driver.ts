import * as nodemailer from 'nodemailer';
import { MailDriver, MailMessage } from './mail-driver.interface';

export interface SmtpDriverConfig {
  host: string;
  port: number;
  secure?: boolean;
  username?: string;
  password?: string;
}

export class SmtpDriver implements MailDriver {
  constructor(private readonly config: SmtpDriverConfig) {}

  async send(message: MailMessage): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure ?? this.config.port === 465,
      auth: this.config.username
        ? {
            user: this.config.username,
            pass: this.config.password,
          }
        : undefined,
    });

    await transporter.sendMail({
      from: `"${message.from.name || message.from.address}" <${message.from.address}>`,
      to: message.to,
      subject: message.subject,
      html: message.html,
    });
  }
}
