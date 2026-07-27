import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OptionsService } from '../options/options.service';
import { encrypt, decrypt } from '../../common/utils/crypto.util';
import { StorageDriver } from './drivers/storage-driver.interface';
import { LocalDriver } from './drivers/local.driver';
import { S3Driver } from './drivers/s3.driver';
import { StorageConfigDto } from './dto/storage-config.dto';

const OPTION_KEY = 'storage_runtime_config';

type StorageDriverName = 'local' | 's3';

interface StorageRuntimeConfig {
  disk: StorageDriverName;
  s3?: {
    accessKeyIdEncrypted: string;
    secretAccessKeyEncrypted: string;
    region: string;
    bucket: string;
    endpoint?: string;
    forcePathStyle?: boolean;
  };
}

@Injectable()
export class StorageConfigService {
  constructor(
    private readonly optionsService: OptionsService,
    private readonly configService: ConfigService,
  ) {}

  private get appKey(): string {
    return this.configService.get<string>('app.key') || 'default_secret_key';
  }

  private get appUrl(): string {
    return this.configService.get<string>('app.url') || process.env.APP_URL || 'http://localhost:3000';
  }

  private async getRawConfig(): Promise<StorageRuntimeConfig | null> {
    return this.optionsService.getOption(OPTION_KEY, null);
  }

  async getMaskedConfig() {
    const config = await this.getRawConfig();
    if (!config) {
      return { disk: 'local' as StorageDriverName };
    }
    return {
      disk: config.disk,
      s3: config.s3
        ? {
            region: config.s3.region,
            bucket: config.s3.bucket,
            endpoint: config.s3.endpoint,
            forcePathStyle: config.s3.forcePathStyle,
            configured: !!config.s3.accessKeyIdEncrypted,
          }
        : undefined,
    };
  }

  async saveConfig(dto: StorageConfigDto) {
    const existing = (await this.getRawConfig()) || { disk: 'local' as StorageDriverName };
    const next: StorageRuntimeConfig = { ...existing, disk: dto.disk as StorageDriverName };

    if (dto.s3) {
      next.s3 = {
        accessKeyIdEncrypted: dto.s3.accessKeyId
          ? encrypt(dto.s3.accessKeyId, this.appKey)
          : (existing.s3?.accessKeyIdEncrypted ?? ''),
        secretAccessKeyEncrypted: dto.s3.secretAccessKey
          ? encrypt(dto.s3.secretAccessKey, this.appKey)
          : (existing.s3?.secretAccessKeyEncrypted ?? ''),
        region: dto.s3.region ?? existing.s3?.region ?? 'us-east-1',
        bucket: dto.s3.bucket ?? existing.s3?.bucket ?? '',
        endpoint: dto.s3.endpoint ?? existing.s3?.endpoint,
        forcePathStyle: dto.s3.forcePathStyle ?? existing.s3?.forcePathStyle,
      };
    }

    await this.optionsService.setOption(OPTION_KEY, next, false);
    return this.getMaskedConfig();
  }

  private buildS3Driver(config: StorageRuntimeConfig): S3Driver | null {
    if (!config.s3) return null;
    return new S3Driver({
      accessKeyId: decrypt(config.s3.accessKeyIdEncrypted, this.appKey),
      secretAccessKey: decrypt(config.s3.secretAccessKeyEncrypted, this.appKey),
      region: config.s3.region,
      bucket: config.s3.bucket,
      endpoint: config.s3.endpoint,
      forcePathStyle: config.s3.forcePathStyle,
    });
  }

  /**
   * Driver + tên disk hiệu lực hiện tại theo cấu hình Settings. Mặc định LocalDriver nếu
   * chưa từng cấu hình gì (giữ "zero infra mặc định" — không bắt ai cũng phải có S3).
   */
  async getEffectiveDriver(): Promise<{ driver: StorageDriver; disk: StorageDriverName }> {
    const config = await this.getRawConfig();
    if (!config || config.disk === 'local') {
      return { driver: new LocalDriver({ appUrl: this.appUrl }), disk: 'local' };
    }

    const s3Driver = this.buildS3Driver(config);
    if (!s3Driver) {
      return { driver: new LocalDriver({ appUrl: this.appUrl }), disk: 'local' };
    }
    return { driver: s3Driver, disk: 's3' };
  }

  /**
   * Driver theo ĐÚNG disk đã lưu 1 file cụ thể (cột `disk` trên chính dòng Media) — dùng khi
   * xoá/thay thế file cũ, để không vỡ file cũ khi admin đổi driver giữa chừng (file cũ vẫn ở
   * disk cũ, không tự nhảy theo driver mới).
   */
  async getDriverForDisk(disk: string): Promise<StorageDriver> {
    if (disk !== 's3') {
      return new LocalDriver({ appUrl: this.appUrl });
    }
    const config = await this.getRawConfig();
    const s3Driver = config ? this.buildS3Driver(config) : null;
    return s3Driver ?? new LocalDriver({ appUrl: this.appUrl });
  }

  async testConnection(): Promise<void> {
    const config = await this.getRawConfig();
    if (!config || config.disk !== 's3') {
      throw new BadRequestException('Chưa chọn driver S3 để kiểm tra kết nối.');
    }
    const s3Driver = this.buildS3Driver(config);
    if (!s3Driver) {
      throw new BadRequestException('Chưa cấu hình đủ thông tin S3 (bucket/credentials).');
    }
    try {
      await s3Driver.testConnection();
    } catch (error: any) {
      throw new BadRequestException(`Kết nối S3 thất bại: ${error.message}`);
    }
  }
}
