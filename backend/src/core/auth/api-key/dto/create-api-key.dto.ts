import { IsString, IsOptional, IsArray, ArrayMinSize, IsDateString } from 'class-validator';

export class CreateApiKeyDto {
  @IsString()
  name: string;

  // Bắt buộc chọn ít nhất 1 quyền cụ thể — không cho mặc định wildcard '*' (xem ApiKeyService.create).
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  permissions: string[];

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
