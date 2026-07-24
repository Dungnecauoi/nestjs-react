import { IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

export class AssignUserRolesDto {
  @ApiProperty({
    example: ['role_id_1', 'role_id_2'],
    description: 'Danh sách ID Vai trò (Role) gán cho User',
  })
  @IsArray()
  @IsNotEmpty({ message: i18nValidationMessage('validation.NOT_EMPTY') })
  roleIds: string[];
}
