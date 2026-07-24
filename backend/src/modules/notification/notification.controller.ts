import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../core/auth/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { I18nLang } from 'nestjs-i18n';

@ApiTags('Notification Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @RequirePermissions('notification:read')
  @ApiOperation({ summary: 'Lấy danh sách thông báo của người dùng' })
  async findAll(@CurrentUser() user: any, @Query() query: QueryNotificationDto) {
    return this.notificationService.findAllForUser(user.id, query);
  }

  @Patch(':id/read')
  @RequirePermissions('notification:update')
  @ApiOperation({ summary: 'Đánh dấu 1 thông báo là đã đọc' })
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @I18nLang() lang: string,
  ) {
    return this.notificationService.markAsRead(id, user.id, lang);
  }

  @Patch('read-all')
  @RequirePermissions('notification:update')
  @ApiOperation({ summary: 'Đánh dấu tất cả thông báo là đã đọc' })
  async markAllAsRead(@CurrentUser() user: any) {
    return this.notificationService.markAllAsRead(user.id);
  }

  @Post('test')
  @RequirePermissions('notification:update')
  @ApiOperation({ summary: 'Gửi thông báo thử nghiệm (Realtime Test Endpoint)' })
  async sendTestNotification(
    @Body() dto: CreateNotificationDto,
    @I18nLang() lang: string,
  ) {
    return this.notificationService.create(dto, lang);
  }

  @Delete(':id')
  @RequirePermissions('notification:delete')
  @ApiOperation({ summary: 'Xóa 1 thông báo' })
  async remove(@Param('id') id: string, @I18nLang() lang: string) {
    return this.notificationService.remove(id, lang);
  }
}
