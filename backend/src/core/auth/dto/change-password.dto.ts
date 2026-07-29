import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Mật khẩu hiện tại' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ description: 'Mật khẩu mới', example: 'NewSecurePassword123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
