import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OptionsService } from '../options/options.service';
import { encrypt, decrypt } from '../../common/utils/crypto.util';
import { MailDriver, MailMessage } from './drivers/mail-driver.interface';
import { SmtpDriver } from './drivers/smtp.driver';
import { ResendDriver } from './drivers/resend.driver';
import { SesDriver } from './drivers/ses.driver';
import { MailgunDriver } from './drivers/mailgun.driver';
import { SendGridDriver } from './drivers/sendgrid.driver';
import { GmailOAuthDriver } from './drivers/gmail-oauth.driver';
import { GmailOAuthService } from './gmail-oauth.service';
import { MailConfigDto } from './dto/mail-config.dto';

const OPTION_KEY = 'mail_runtime_config';

type MailDriverName = 'log' | 'smtp' | 'gmail_oauth' | 'resend' | 'ses' | 'mailgun' | 'sendgrid';

interface MailRuntimeConfig {
  driver: MailDriverName;
  fromAddress?: string;
  fromName?: string;
  smtp?: { host: string; port: number; secure?: boolean; username?: string; passwordEncrypted?: string };
  gmailOauth?: { email: string; refreshTokenEncrypted: string };
  resend?: { apiKeyEncrypted: string };
  ses?: { accessKeyIdEncrypted: string; secretAccessKeyEncrypted: string; region: string };
  mailgun?: { apiKeyEncrypted: string; domain: string };
  sendgrid?: { apiKeyEncrypted: string };
}

@Injectable()
export class MailConfigService {
  constructor(
    private readonly optionsService: OptionsService,
    private readonly configService: ConfigService,
    private readonly gmailOAuthService: GmailOAuthService,
  ) {}

  private get appKey(): string {
    return this.configService.get<string>('app.key') || 'default_secret_key';
  }

  private async getRawConfig(): Promise<MailRuntimeConfig | null> {
    return this.optionsService.getOption(OPTION_KEY, null);
  }

  async getMaskedConfig() {
    const config = await this.getRawConfig();
    if (!config) {
      return { driver: 'log' as MailDriverName };
    }

    return {
      driver: config.driver,
      fromAddress: config.fromAddress,
      fromName: config.fromName,
      smtp: config.smtp
        ? {
            host: config.smtp.host,
            port: config.smtp.port,
            secure: config.smtp.secure,
            username: config.smtp.username,
            configured: !!config.smtp.passwordEncrypted,
          }
        : undefined,
      gmailOauth: config.gmailOauth ? { email: config.gmailOauth.email, configured: true } : undefined,
      resend: config.resend ? { configured: true } : undefined,
      ses: config.ses ? { region: config.ses.region, configured: true } : undefined,
      mailgun: config.mailgun ? { domain: config.mailgun.domain, configured: true } : undefined,
      sendgrid: config.sendgrid ? { configured: true } : undefined,
    };
  }

  async saveConfig(dto: MailConfigDto) {
    const existing = (await this.getRawConfig()) || { driver: 'log' as MailDriverName };
    const next: MailRuntimeConfig = {
      ...existing,
      driver: dto.driver as MailDriverName,
    };

    if (dto.fromAddress !== undefined) next.fromAddress = dto.fromAddress;
    if (dto.fromName !== undefined) next.fromName = dto.fromName;

    if (dto.smtp) {
      next.smtp = {
        host: dto.smtp.host ?? existing.smtp?.host ?? '',
        port: dto.smtp.port ?? existing.smtp?.port ?? 587,
        secure: dto.smtp.secure ?? existing.smtp?.secure,
        username: dto.smtp.username ?? existing.smtp?.username,
        passwordEncrypted: dto.smtp.password
          ? encrypt(dto.smtp.password, this.appKey)
          : existing.smtp?.passwordEncrypted,
      };
    }

    if (dto.resend) {
      next.resend = {
        apiKeyEncrypted: dto.resend.apiKey
          ? encrypt(dto.resend.apiKey, this.appKey)
          : existing.resend?.apiKeyEncrypted ?? '',
      };
    }

    if (dto.ses) {
      next.ses = {
        accessKeyIdEncrypted: dto.ses.accessKeyId
          ? encrypt(dto.ses.accessKeyId, this.appKey)
          : existing.ses?.accessKeyIdEncrypted ?? '',
        secretAccessKeyEncrypted: dto.ses.secretAccessKey
          ? encrypt(dto.ses.secretAccessKey, this.appKey)
          : existing.ses?.secretAccessKeyEncrypted ?? '',
        region: dto.ses.region ?? existing.ses?.region ?? 'us-east-1',
      };
    }

    if (dto.mailgun) {
      next.mailgun = {
        apiKeyEncrypted: dto.mailgun.apiKey
          ? encrypt(dto.mailgun.apiKey, this.appKey)
          : existing.mailgun?.apiKeyEncrypted ?? '',
        domain: dto.mailgun.domain ?? existing.mailgun?.domain ?? '',
      };
    }

    if (dto.sendgrid) {
      next.sendgrid = {
        apiKeyEncrypted: dto.sendgrid.apiKey
          ? encrypt(dto.sendgrid.apiKey, this.appKey)
          : existing.sendgrid?.apiKeyEncrypted ?? '',
      };
    }

    await this.optionsService.setOption(OPTION_KEY, next, false);
    return this.getMaskedConfig();
  }

  async saveGmailOAuth(email: string, refreshToken: string) {
    const existing = (await this.getRawConfig()) || { driver: 'log' as MailDriverName };
    const next: MailRuntimeConfig = {
      ...existing,
      driver: 'gmail_oauth',
      gmailOauth: { email, refreshTokenEncrypted: encrypt(refreshToken, this.appKey) },
    };
    await this.optionsService.setOption(OPTION_KEY, next, false);
    return this.getMaskedConfig();
  }

  async disconnectGmail() {
    const existing = await this.getRawConfig();
    if (!existing) {
      return this.getMaskedConfig();
    }
    const { gmailOauth, ...rest } = existing;
    const next: MailRuntimeConfig = {
      ...rest,
      driver: existing.driver === 'gmail_oauth' ? 'log' : existing.driver,
    };
    await this.optionsService.setOption(OPTION_KEY, next, false);
    return this.getMaskedConfig();
  }

  /**
   * Trả về driver + from-address hiệu lực hiện tại. Trả null nếu chưa cấu hình gì
   * (driver 'log' hoặc chưa từng lưu) — MailService tự hiểu là log ra console.
   */
  async getEffectiveDriver(): Promise<{ driver: MailDriver; from: { address: string; name?: string } } | null> {
    const config = await this.getRawConfig();
    if (!config || config.driver === 'log') {
      return null;
    }

    const from = {
      address: config.fromAddress || this.configService.get<string>('mail.fromAddress') || 'info@example.com',
      name: config.fromName || this.configService.get<string>('mail.fromName'),
    };

    switch (config.driver) {
      case 'smtp': {
        if (!config.smtp) return null;
        return {
          from,
          driver: new SmtpDriver({
            host: config.smtp.host,
            port: config.smtp.port,
            secure: config.smtp.secure,
            username: config.smtp.username,
            password: config.smtp.passwordEncrypted
              ? decrypt(config.smtp.passwordEncrypted, this.appKey)
              : undefined,
          }),
        };
      }
      case 'gmail_oauth': {
        if (!config.gmailOauth) return null;
        return {
          from,
          driver: new GmailOAuthDriver(
            { refreshToken: decrypt(config.gmailOauth.refreshTokenEncrypted, this.appKey) },
            this.gmailOAuthService,
          ),
        };
      }
      case 'resend': {
        if (!config.resend) return null;
        return {
          from,
          driver: new ResendDriver({ apiKey: decrypt(config.resend.apiKeyEncrypted, this.appKey) }),
        };
      }
      case 'ses': {
        if (!config.ses) return null;
        return {
          from,
          driver: new SesDriver({
            accessKeyId: decrypt(config.ses.accessKeyIdEncrypted, this.appKey),
            secretAccessKey: decrypt(config.ses.secretAccessKeyEncrypted, this.appKey),
            region: config.ses.region,
          }),
        };
      }
      case 'mailgun': {
        if (!config.mailgun) return null;
        return {
          from,
          driver: new MailgunDriver({
            apiKey: decrypt(config.mailgun.apiKeyEncrypted, this.appKey),
            domain: config.mailgun.domain,
          }),
        };
      }
      case 'sendgrid': {
        if (!config.sendgrid) return null;
        return {
          from,
          driver: new SendGridDriver({ apiKey: decrypt(config.sendgrid.apiKeyEncrypted, this.appKey) }),
        };
      }
      default:
        return null;
    }
  }

  async sendTestEmail(testEmail: string): Promise<void> {
    const resolved = await this.getEffectiveDriver();
    if (!resolved) {
      throw new BadRequestException(
        'Chưa cấu hình driver gửi mail thật (đang ở chế độ log) — hãy lưu cấu hình trước khi gửi thử.',
      );
    }

    const message: MailMessage = {
      to: testEmail,
      subject: 'Email thử nghiệm cấu hình Mail',
      html: '<p>Đây là email thử nghiệm để xác nhận cấu hình gửi mail của hệ thống hoạt động chính xác.</p>',
      from: resolved.from,
    };

    try {
      await resolved.driver.send(message);
    } catch (error: any) {
      throw new BadRequestException(`Gửi email thử nghiệm thất bại: ${error.message}`);
    }
  }
}
