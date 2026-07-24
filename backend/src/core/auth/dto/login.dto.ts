import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

export class LoginDto {
  @ApiProperty({ example: 'admin@ecomcx.com', description: 'Email tài khoản' })
  @IsEmail({}, { message: i18nValidationMessage('validation.IS_EMAIL') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.NOT_EMPTY') })
  email: string;

  @ApiProperty({ example: '123456', description: 'Mật khẩu' })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.NOT_EMPTY') })
  @MinLength(6, { message: i18nValidationMessage('validation.MIN_LENGTH') })
  password: string;
}
