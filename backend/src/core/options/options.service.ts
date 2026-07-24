import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class OptionsService {
  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.option.upsert({
      where: { optionName },
      update: { optionValue: valueStr, autoload },
      create: { optionName, optionValue: valueStr, autoload },
    });
  }

  async getAllOptions() {
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
