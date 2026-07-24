import { IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

export class AssignPermissionsToRoleDto {
  @ApiProperty({ example: ['perm_id_1', 'perm_id_2'], description: 'Mảng chứa danh sách ID Quyền hạn gán cho Role' })
  @IsArray()
  @IsNotEmpty({ message: i18nValidationMessage('validation.NOT_EMPTY') })
  permissionIds: string[];
}
