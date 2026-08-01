import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from '@nestjs/cache-manager';
import { PrismaService } from '../database/prisma.service';
import { CacheKeyEnum } from '../../common/enums/cache-key.enum';

@Injectable()
export class OptionsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  /**
   * Xóa cache targeted theo đúng key của tab/mô-đun đang lưu (Targeted Cache Invalidation)
   * Giúp tối ưu hiệu năng: tab nào thay đổi chỉ xóa cache tab đó + key tổng ALL_OPTIONS
   */
  async clearOptionsCache(specificKey?: CacheKeyEnum): Promise<void> {
    if (specificKey) {
      await Promise.all([
        this.cacheManager.del(specificKey).catch(() => {}),
        this.cacheManager.del(CacheKeyEnum.ALL_OPTIONS).catch(() => {}),
      ]);
      return;
    }

    const keysToInvalidate = [
      CacheKeyEnum.ALL_OPTIONS,
      CacheKeyEnum.MEDIA_OPTIONS,
      CacheKeyEnum.GENERAL_OPTIONS,
      CacheKeyEnum.READING_OPTIONS,
      CacheKeyEnum.WRITING_OPTIONS,
      CacheKeyEnum.MAIL_CONFIG,
      CacheKeyEnum.STORAGE_CONFIG,
    ];
    await Promise.all(keysToInvalidate.map((key) => this.cacheManager.del(key).catch(() => {})));
  }

  async getOption(optionName: string, defaultValue: any = null) {
    const record = await this.prisma.option.findUnique({
      where: { optionName },
    });
    if (!record || record.optionValue === null) {
      return defaultValue;
    }
    if (record.optionValue === 'true') return true;
    if (record.optionValue === 'false') return false;
    try {
      return JSON.parse(record.optionValue);
    } catch {
      return record.optionValue;
    }
  }

  async setOption(
    optionName: string,
    optionValue: any,
    autoload: boolean = true,
  ) {
    const valueStr =
      typeof optionValue === 'object' && optionValue !== null
        ? JSON.stringify(optionValue)
        : String(optionValue ?? '');

    const result = await this.prisma.option.upsert({
      where: { optionName },
      update: { optionValue: valueStr, autoload },
      create: { optionName, optionValue: valueStr, autoload },
    });

    await this.clearOptionsCache();
    return result;
  }

  async get<T = any>(optionName: string, defaultValue: T = null as any): Promise<T> {
    return this.getOption(optionName, defaultValue);
  }

  async set(optionName: string, optionValue: any, autoload: boolean = true) {
    return this.setOption(optionName, optionValue, autoload);
  }

  async getAllOptions() {
    const cached = await this.cacheManager.get<Record<string, any>>(CacheKeyEnum.ALL_OPTIONS);
    if (cached) {
      return cached;
    }

    const records = await this.prisma.option.findMany({
      where: { autoload: true },
    });

    const result: Record<string, any> = {};
    for (const item of records) {
      if (item.optionValue !== null) {
        if (item.optionValue === 'true') {
          result[item.optionName] = true;
        } else if (item.optionValue === 'false') {
          result[item.optionName] = false;
        } else {
          try {
            result[item.optionName] = JSON.parse(item.optionValue);
          } catch {
            result[item.optionName] = item.optionValue;
          }
        }
      }
    }

    await this.cacheManager.set(CacheKeyEnum.ALL_OPTIONS, result);
    return result;
  }

  async getPublicOptions() {
    const all = await this.getAllOptions();
    const publicKeys = [
      'site_title',
      'site_description',
      'site_logo',
      'site_favicon',
      'maintenance_mode',
      'active_languages',
      'dateFormat',
      'timeFormat',
      'timezone',
    ];

    const publicData: Record<string, any> = {};
    for (const key of publicKeys) {
      if (key in all) {
        publicData[key] = all[key];
      }
    }
    return publicData;
  }

  async setMultipleOptions(options: Record<string, any>) {
    for (const [key, val] of Object.entries(options)) {
      const valueStr =
        typeof val === 'object' && val !== null
          ? JSON.stringify(val)
          : String(val ?? '');

      await this.prisma.option.upsert({
        where: { optionName: key },
        update: { optionValue: valueStr, autoload: true },
        create: { optionName: key, optionValue: valueStr, autoload: true },
      });
    }
    await this.clearOptionsCache();
    return this.getAllOptions();
  }
}
