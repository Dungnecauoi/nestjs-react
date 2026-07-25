import Mailgun from 'mailgun.js';
import FormData from 'form-data';
import { MailDriver, MailMessage } from './mail-driver.interface';

export interface MailgunDriverConfig {
  apiKey: string;
  domain: string;
}

export class MailgunDriver implements MailDriver {
  constructor(private readonly config: MailgunDriverConfig) {}

  async send(message: MailMessage): Promise<void> {
    const mailgun = new Mailgun(FormData);
    const client = mailgun.client({ username: 'api', key: this.config.apiKey });

    await client.messages.create(this.config.domain, {
      from: `${message.from.name || message.from.address} <${message.from.address}>`,
      to: [message.to],
      subject: message.subject,
      html: message.html,
    });
  }
}
