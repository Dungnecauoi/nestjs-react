import { IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

export class AssignUserPermissionsDto {
  @ApiProperty({
    example: ['perm_id_1', 'perm_id_2'],
    description: 'Danh sách ID Quyền hạn gán TRỰC TIẾP cho User',
  })
  @IsArray()
  @IsNotEmpty({ message: i18nValidationMessage('validation.NOT_EMPTY') })
  permissionIds: string[];
}
