import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'admin@ecomcx.com',
    description: 'Email tài khoản cần đặt lại mật khẩu',
  })
  @IsEmail({}, { message: i18nValidationMessage('validation.IS_EMAIL') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.NOT_EMPTY') })
  email: string;
}
