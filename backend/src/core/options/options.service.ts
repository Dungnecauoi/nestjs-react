import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from '@nestjs/cache-manager';
import { PrismaService } from '../database/prisma.service';

const ALL_OPTIONS_CACHE_KEY = 'options:all';

@Injectable()
export class OptionsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getOption(optionName: string, defaultValue: any = null) {
    const record = await this.prisma.option.findUnique({
      where: { optionName },
    });
    if (!record || record.optionValue === null) {
      return defaultValue;
    }
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
      typeof optionValue === 'object'
        ? JSON.stringify(optionValue)
        : String(optionValue);

    const result = await this.prisma.option.upsert({
      where: { optionName },
      update: { optionValue: valueStr, autoload },
      create: { optionName, optionValue: valueStr, autoload },
    });

    await this.cacheManager.del(ALL_OPTIONS_CACHE_KEY);
    return result;
  }

  async get<T = any>(optionName: string, defaultValue: T = null as any): Promise<T> {
    return this.getOption(optionName, defaultValue);
  }

  async set(optionName: string, optionValue: any, autoload: boolean = true) {
    return this.setOption(optionName, optionValue, autoload);
  }

  async getAllOptions() {
    const cached = await this.cacheManager.get<Record<string, any>>(ALL_OPTIONS_CACHE_KEY);
    if (cached) {
      return cached;
    }

    const records = await this.prisma.option.findMany({
      where: { autoload: true },
    });

    const result: Record<string, any> = {};
    for (const item of records) {
      if (item.optionValue !== null) {
        try {
          result[item.optionName] = JSON.parse(item.optionValue);
        } catch {
          result[item.optionName] = item.optionValue;
        }
      }
    }

    await this.cacheManager.set(ALL_OPTIONS_CACHE_KEY, result);
    return result;
  }

  async setMultipleOptions(options: Record<string, any>) {
    const promises = Object.entries(options).map(([key, val]) =>
      this.setOption(key, val),
    );
    await Promise.all(promises);
    return this.getAllOptions();
  }
}
