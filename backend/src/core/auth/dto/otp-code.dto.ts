import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class OtpCodeDto {
  @ApiProperty({ description: 'Mã 6 chữ số TOTP 2FA OTP', example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otpCode: string;
}
