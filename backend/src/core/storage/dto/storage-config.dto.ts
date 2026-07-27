import { IsIn, IsOptional, IsObject } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export const STORAGE_DRIVERS = ['local', 's3'] as const;

export class StorageConfigDto {
  @ApiProperty({ enum: STORAGE_DRIVERS })
  @IsIn(STORAGE_DRIVERS)
  disk: string;

  @ApiPropertyOptional({
    description:
      'Cấu hình S3/MinIO: accessKeyId, secretAccessKey (để trống = giữ nguyên), region, bucket, endpoint (MinIO/S3-compatible), forcePathStyle',
  })
  @IsObject()
  @IsOptional()
  s3?: {
    accessKeyId?: string;
    secretAccessKey?: string;
    region?: string;
    bucket?: string;
    endpoint?: string;
    forcePathStyle?: boolean;
  };
}
