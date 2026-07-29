import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ description: 'Token xác minh địa chỉ email' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
