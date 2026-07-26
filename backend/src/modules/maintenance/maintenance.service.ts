import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { OptionsService } from '../../core/options/options.service';

@Injectable()
export class MaintenanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly optionsService: OptionsService,
  ) {}

  async getStatus() {
    const isMaintenance = await this.optionsService.get<boolean>('maintenanceMode', false);
    return { maintenanceMode: !!isMaintenance };
  }

  async setMaintenanceMode(enabled: boolean) {
    await this.optionsService.set('maintenanceMode', enabled);
    return {
      success: true,
      maintenanceMode: enabled,
      message: enabled
        ? 'Đã BẬT chế độ bảo trì hệ thống (Maintenance Mode)'
        : 'Đã TẮT chế độ bảo trì hệ thống',
    };
  }

  async generateSystemBackup() {
    const [users, roles, permissions, departments, options] = await Promise.all([
      this.prisma.user.findMany({ select: { id: true, email: true, name: true, phone: true, isActive: true, createdAt: true } }),
      this.prisma.role.findMany(),
      this.prisma.permission.findMany(),
      this.prisma.department.findMany(),
      this.prisma.option.findMany(),
    ]);

    const backupPayload = {
      meta: {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
      },
      data: {
        users,
        roles,
        permissions,
        departments,
        options,
      },
    };

    return JSON.stringify(backupPayload, null, 2);
  }
}
