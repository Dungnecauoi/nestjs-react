import { IsString, IsOptional, IsArray, ArrayMinSize } from 'class-validator';

export class UpdateApiKeyDto {
  @IsOptional()
  @IsString()
  name?: string;

  // Không cho truyền rỗng để "xoá hết quyền" nhầm qua field optional — muốn tắt hẳn key thì dùng revoke.
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  permissions?: string[];
}
