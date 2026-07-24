import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'IT', description: 'Mã phòng ban / team' })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.NOT_EMPTY') })
  code: string;

  @ApiProperty({ example: 'Phòng Công Nghệ', description: 'Tên phòng ban' })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.NOT_EMPTY') })
  name: string;

  @ApiPropertyOptional({ description: 'Mô tả phòng ban' })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'ID phòng ban cấp cha (nếu có)' })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsOptional()
  parentId?: string;
}
