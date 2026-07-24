import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ description: 'Mật khẩu hiện tại (Cần nhập nếu đổi mật khẩu)' })
  @IsString()
  @IsOptional()
  currentPassword?: string;

  @ApiPropertyOptional({ description: 'Mật khẩu mới thay thế' })
  @IsString()
  @IsOptional()
  @MinLength(6)
  newPassword?: string;
}
