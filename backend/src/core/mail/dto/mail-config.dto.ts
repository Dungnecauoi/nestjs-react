import { IsIn, IsString, IsOptional, IsObject, IsEmail } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export const MAIL_DRIVERS = [
  'log',
  'smtp',
  'gmail_oauth',
  'resend',
  'ses',
  'mailgun',
  'sendgrid',
] as const;

export class MailConfigDto {
  @ApiProperty({ enum: MAIL_DRIVERS })
  @IsIn(MAIL_DRIVERS)
  driver: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fromAddress?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fromName?: string;

  @ApiPropertyOptional({ description: 'Cấu hình SMTP: host, port, secure, username, password (để trống password = giữ nguyên)' })
  @IsObject()
  @IsOptional()
  smtp?: {
    host?: string;
    port?: number;
    secure?: boolean;
    username?: string;
    password?: string;
  };

  @ApiPropertyOptional({ description: 'Cấu hình Resend: apiKey (để trống = giữ nguyên)' })
  @IsObject()
  @IsOptional()
  resend?: { apiKey?: string };

  @ApiPropertyOptional({ description: 'Cấu hình Amazon SES: accessKeyId, secretAccessKey, region' })
  @IsObject()
  @IsOptional()
  ses?: { accessKeyId?: string; secretAccessKey?: string; region?: string };

  @ApiPropertyOptional({ description: 'Cấu hình Mailgun: apiKey, domain' })
  @IsObject()
  @IsOptional()
  mailgun?: { apiKey?: string; domain?: string };

  @ApiPropertyOptional({ description: 'Cấu hình SendGrid: apiKey' })
  @IsObject()
  @IsOptional()
  sendgrid?: { apiKey?: string };
}

export class MailTestDto {
  @ApiProperty({ example: 'admin@ecomcx.com' })
  @IsEmail()
  testEmail: string;
}

export class GmailExchangeDto {
  @ApiProperty({ description: 'Authorization code Google trả về sau khi user đồng ý' })
  @IsString()
  code: string;
}
