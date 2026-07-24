import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsDateString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Địa chỉ Email người dùng', example: 'user@ecomcx.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Họ và tên đầy đủ', example: 'Nguyễn Văn A' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Mật khẩu khởi tạo', example: 'SecurePassword123!' })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ description: 'Đường dẫn ảnh đại diện Avatar' })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại di động', example: '0987654321' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Số định danh CCCD / CMND', example: '001098765432' })
  @IsString()
  @IsOptional()
  identityCard?: string;

  @ApiPropertyOptional({ description: 'Giới tính (Nam / Nữ / Khác)', example: 'Nam' })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ description: 'Ngày sinh ISO Date', example: '1995-05-15' })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ thường trú / tạm trú' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'Ghi chú / Tiểu sử nhân sự' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ description: 'Trạng thái hoạt động tài khoản', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Mảng mã Vai trò (Role Codes) gán cho người dùng', example: ['admin', 'manager'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roleCodes?: string[];

  @ApiPropertyOptional({ description: 'Mảng mã Quyền hạn trực tiếp (Permission Codes)', example: ['media:create'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissionCodes?: string[];

  @ApiPropertyOptional({ description: 'Mảng ID Phòng ban trực thuộc' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  departmentIds?: string[];
}
