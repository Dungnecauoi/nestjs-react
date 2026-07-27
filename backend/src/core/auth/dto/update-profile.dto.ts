import { IsString, IsOptional, IsDateString, IsUUID } from 'class-validator';

// Self-service: chỉ các field an toàn người dùng được tự sửa hồ sơ của chính mình.
// KHÔNG có roleCodes/permissionCodes/isActive/departmentIds — những field đó chỉ admin
// sửa được qua UserController (PATCH /users/:id, yêu cầu quyền user:update).
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  // Bắt buộc trỏ tới 1 Media đã upload thật (do MediaController kiểm tra quyền/loại file),
  // không nhận URL tự do — tránh user set avatar bằng URL bất kỳ không qua kiểm soát.
  @IsOptional()
  @IsUUID()
  avatarMediaId?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  identityCard?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}
