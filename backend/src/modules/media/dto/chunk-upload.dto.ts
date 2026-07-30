import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class InitChunkUploadDto {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  totalChunks: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  totalSize: number;

  @IsString()
  @IsOptional()
  mimetype?: string;
}

export class UploadChunkDto {
  @IsString()
  @IsNotEmpty()
  uploadId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  chunkIndex: number;
}

export class CompleteChunkUploadDto {
  @IsString()
  @IsNotEmpty()
  uploadId: string;
}
