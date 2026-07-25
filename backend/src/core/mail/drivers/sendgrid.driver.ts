import * as sgMail from '@sendgrid/mail';
import { MailDriver, MailMessage } from './mail-driver.interface';

export interface SendGridDriverConfig {
  apiKey: string;
}

export class SendGridDriver implements MailDriver {
  constructor(private readonly config: SendGridDriverConfig) {}

  async send(message: MailMessage): Promise<void> {
    sgMail.setApiKey(this.config.apiKey);

    await sgMail.send({
      from: { email: message.from.address, name: message.from.name },
      to: message.to,
      subject: message.subject,
      html: message.html,
    });
  }
}
