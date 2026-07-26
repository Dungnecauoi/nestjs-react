import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../core/auth/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Webhook Engine Module')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Get()
  @RequirePermissions('setting:read')
  @ApiOperation({ summary: 'Lấy danh sách các Webhooks đăng ký' })
  findAll() {
    return this.webhookService.findAll();
  }

  @Get('available-events')
  @RequirePermissions('setting:read')
  @ApiOperation({ summary: 'Lấy danh sách các sự kiện Webhook khả dụng phân loại theo Module' })
  getAvailableEvents() {
    return this.webhookService.getAvailableEvents();
  }

  @Post()
  @RequirePermissions('setting:update')
  @ApiOperation({ summary: 'Tạo mới Webhook Endpoint' })
  create(@Body() dto: CreateWebhookDto) {
    return this.webhookService.create(dto);
  }

  @Post(':id/ping')
  @RequirePermissions('setting:update')
  @ApiOperation({ summary: 'Kiểm tra gửi tín hiệu Test Ping đến Webhook' })
  ping(@Param('id') id: string) {
    return this.webhookService.testPing(id);
  }

  @Delete(':id')
  @RequirePermissions('setting:update')
  @ApiOperation({ summary: 'Xóa Webhook Endpoint' })
  delete(@Param('id') id: string) {
    return this.webhookService.delete(id);
  }
}
