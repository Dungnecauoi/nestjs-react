import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OptionsService } from './options.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Options & System Settings Module')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('options')
export class OptionsController {
  constructor(private readonly optionsService: OptionsService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Lấy toàn bộ cấu hình hệ thống (wp_options architecture)',
  })
  async getAllOptions() {
    const data = await this.optionsService.getAllOptions();
    return {
      success: true,
      data,
    };
  }

  @ApiBearerAuth()
  @RequirePermissions('setting:update')
  @Post()
  @ApiOperation({
    summary: 'Lưu hoặc cập nhật hàng loạt cấu hình hệ thống vào Database',
  })
  async setOptions(@Body() options: Record<string, any>) {
    const updated = await this.optionsService.setMultipleOptions(options);
    return {
      success: true,
      message: 'Đã lưu cấu hình hệ thống vào Database thành công!',
      data: updated,
    };
  }
}
