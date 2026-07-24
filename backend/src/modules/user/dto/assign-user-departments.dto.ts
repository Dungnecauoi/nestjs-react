import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

export class AssignUserDepartmentsDto {
  @ApiProperty({ example: ['dept_id_1', 'dept_id_2'], description: 'Danh sách ID Phòng ban / Team gán cho User' })
  @IsArray()
  @IsNotEmpty({ message: i18nValidationMessage('validation.NOT_EMPTY') })
  departmentIds: string[];

  @ApiPropertyOptional({ example: 'dept_id_1', description: 'ID Phòng ban chính của User' })
  @IsString()
  @IsOptional()
  primaryDepartmentId?: string;
}
