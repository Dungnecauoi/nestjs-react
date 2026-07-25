import axios from 'axios';
import MailComposer = require('nodemailer/lib/mail-composer');
import { MailDriver, MailMessage } from './mail-driver.interface';
import { GmailOAuthService } from '../gmail-oauth.service';

const GMAIL_SEND_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';

export interface GmailOAuthDriverConfig {
  refreshToken: string;
}

export class GmailOAuthDriver implements MailDriver {
  constructor(
    private readonly config: GmailOAuthDriverConfig,
    private readonly gmailOAuthService: GmailOAuthService,
  ) {}

  async send(message: MailMessage): Promise<void> {
    const accessToken = await this.gmailOAuthService.getAccessToken(this.config.refreshToken);

    const composer = new MailComposer({
      from: `"${message.from.name || message.from.address}" <${message.from.address}>`,
      to: message.to,
      subject: message.subject,
      html: message.html,
    });

    const mimeBuffer: Buffer = await composer.compile().build();
    const raw = mimeBuffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await axios.post(
      GMAIL_SEND_URL,
      { raw },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
  }
}
