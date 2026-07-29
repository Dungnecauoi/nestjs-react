import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class UpdateWebhookDto {
  @ApiPropertyOptional({ description: 'Tên Webhook / Tên hệ thống nhận' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'URL Đích (HTTPS Target URL)' })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({ description: 'Mảng các sự kiện đăng ký lắng nghe' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  events?: string[];

  @ApiPropertyOptional({ description: 'Trạng thái hoạt động của Webhook' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
