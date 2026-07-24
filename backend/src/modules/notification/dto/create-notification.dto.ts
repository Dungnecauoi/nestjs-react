import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateNotificationDto {
  @ApiPropertyOptional({ example: 'user-uuid-123', description: 'ID người nhận thông báo (Để trống nếu gửi toàn hệ thống)' })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsOptional()
  userId?: string;

  @ApiProperty({ example: 'Đăng nhập thiết bị mới', description: 'Tiêu đề thông báo' })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.NOT_EMPTY') })
  title: string;

  @ApiProperty({ example: 'Tài khoản của bạn vừa đăng nhập từ IP 192.168.1.1', description: 'Nội dung thông báo' })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.NOT_EMPTY') })
  content: string;

  @ApiPropertyOptional({ example: 'info', enum: ['info', 'success', 'warning', 'error', 'system'], description: 'Loại thông báo' })
  @IsIn(['info', 'success', 'warning', 'error', 'system'])
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ example: '{"link":"/admin/users/123"}', description: 'JSON metadata đính kèm' })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsOptional()
  data?: string;
}
