import { Resend } from 'resend';
import { MailDriver, MailMessage } from './mail-driver.interface';

export interface ResendDriverConfig {
  apiKey: string;
}

export class ResendDriver implements MailDriver {
  constructor(private readonly config: ResendDriverConfig) {}

  async send(message: MailMessage): Promise<void> {
    const resend = new Resend(this.config.apiKey);

    const result = await resend.emails.send({
      from: `${message.from.name || message.from.address} <${message.from.address}>`,
      to: message.to,
      subject: message.subject,
      html: message.html,
    });

    if (result.error) {
      throw new Error(`Resend gửi mail thất bại: ${result.error.message}`);
    }
  }
}
