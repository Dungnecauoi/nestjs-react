import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { MailDriver, MailMessage } from './mail-driver.interface';

export interface SesDriverConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

export class SesDriver implements MailDriver {
  constructor(private readonly config: SesDriverConfig) {}

  async send(message: MailMessage): Promise<void> {
    const client = new SESv2Client({
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    });

    await client.send(
      new SendEmailCommand({
        FromEmailAddress: `${message.from.name || message.from.address} <${message.from.address}>`,
        Destination: { ToAddresses: [message.to] },
        Content: {
          Simple: {
            Subject: { Data: message.subject, Charset: 'UTF-8' },
            Body: { Html: { Data: message.html, Charset: 'UTF-8' } },
          },
        },
      }),
    );
  }
}
