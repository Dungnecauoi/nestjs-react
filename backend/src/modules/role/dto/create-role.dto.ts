import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateRoleDto {
  @ApiProperty({ example: 'manager', description: 'Mã vai trò' })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.NOT_EMPTY') })
  code: string;

  @ApiProperty({ example: 'Trưởng phòng', description: 'Tên vai trò' })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.NOT_EMPTY') })
  name: string;

  @ApiPropertyOptional({ description: 'Mô tả vai trò' })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: ['permission_id_1', 'permission_id_2'], description: 'Danh sách ID quyền hạn gán vào Role' })
  @IsArray()
  @IsOptional()
  permissionIds?: string[];
}
