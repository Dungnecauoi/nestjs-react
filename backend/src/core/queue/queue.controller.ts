import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QueueService } from './queue.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Queue Management Module')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('queues')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get('stats')
  @RequirePermissions('setting:read')
  @ApiOperation({ summary: 'Lấy thông số thống kê hàng đợi BullMQ (mail queue, active, completed, failed)' })
  getStats() {
    return this.queueService.getQueueStats();
  }

  @Post('clean-completed')
  @RequirePermissions('setting:update')
  @ApiOperation({ summary: 'Xóa danh sách các job đã hoàn thành khỏi hàng đợi' })
  cleanCompleted() {
    return this.queueService.cleanCompletedJobs();
  }

  @Post('clean-failed')
  @RequirePermissions('setting:update')
  @ApiOperation({ summary: 'Xóa danh sách các job bị lỗi khỏi hàng đợi' })
  cleanFailed() {
    return this.queueService.cleanFailedJobs();
  }
}
