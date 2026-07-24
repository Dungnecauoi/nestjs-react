import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreatePermissionDto {
  @ApiProperty({ example: 'order:create', description: 'Mã quyền duy nhất' })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.NOT_EMPTY') })
  code: string;

  @ApiProperty({ example: 'Tạo mới đơn hàng', description: 'Tên quyền hạn' })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.NOT_EMPTY') })
  name: string;

  @ApiProperty({ example: 'order', description: 'Tên module chứa quyền' })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.NOT_EMPTY') })
  module: string;

  @ApiPropertyOptional({ description: 'Mô tả quyền hạn' })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsOptional()
  description?: string;
}
