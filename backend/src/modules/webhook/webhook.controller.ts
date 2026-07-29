import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { JwtOrApiKeyGuard } from '../../core/auth/guards/jwt-or-api-key.guard';
import { PermissionGuard } from '../../core/auth/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Webhook Engine Module')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtOrApiKeyGuard, PermissionGuard)
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

  @Patch(':id')
  @RequirePermissions('setting:update')
  @ApiOperation({ summary: 'Cập nhật Webhook Endpoint' })
  update(@Param('id') id: string, @Body() dto: UpdateWebhookDto) {
    return this.webhookService.update(id, dto);
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
