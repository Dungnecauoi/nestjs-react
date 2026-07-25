import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token đặt lại mật khẩu nhận được qua email' })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.NOT_EMPTY') })
  token: string;

  @ApiProperty({
    example: 'NewSecurePassword123!',
    description: 'Mật khẩu mới',
  })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @MinLength(6, { message: i18nValidationMessage('validation.MIN_LENGTH') })
  newPassword: string;
}
