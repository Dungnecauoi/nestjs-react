import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../core/auth/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Maintenance & System Backup Module')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get('status')
  @ApiOperation({ summary: 'Lấy trạng thái chế độ bảo trì hệ thống' })
  getStatus() {
    return this.maintenanceService.getStatus();
  }

  @Post('toggle')
  @RequirePermissions('setting:update')
  @ApiOperation({ summary: 'Bật/tắt chế độ bảo trì hệ thống (Maintenance Mode)' })
  toggleMode(@Body() body: { enabled: boolean }) {
    return this.maintenanceService.setMaintenanceMode(!!body.enabled);
  }

  @Get('backup')
  @RequirePermissions('setting:update')
  @ApiOperation({ summary: 'Tải file sao lưu dữ liệu hệ thống (System Backup JSON)' })
  async downloadBackup(@Res() res: Response) {
    const jsonString = await this.maintenanceService.generateSystemBackup();
    const filename = `backup_core_erp_${Date.now()}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    return res.send(jsonString);
  }
}
