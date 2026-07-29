import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiSecurity, ApiOperation } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { QueryAuditDto } from './dto/query-audit.dto';
import { JwtOrApiKeyGuard } from '../../core/auth/guards/jwt-or-api-key.guard';
import { PermissionGuard } from '../../core/auth/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { I18nLang } from 'nestjs-i18n';

@ApiTags('Audit Log Management')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtOrApiKeyGuard, PermissionGuard)
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermissions('audit:read')
  @ApiOperation({
    summary: 'Lấy danh sách Nhật Ký Thao Tác (Audit Logs) phân trang',
  })
  async findAll(@Query() query: QueryAuditDto) {
    return this.auditService.findAll(query);
  }

  @Get('stats')
  @RequirePermissions('user:read')
  @ApiOperation({ summary: 'Lấy các chỉ số thống kê tổng quan hệ thống cho Dashboard' })
  async getStats() {
    return this.auditService.getDashboardStats();
  }

  @Get(':id')
  @RequirePermissions('audit:read')
  @ApiOperation({
    summary: 'Lấy chi tiết 1 bản ghi Nhật Ký và dữ liệu So Sánh (Diff)',
  })
  async findOne(@Param('id') id: string, @I18nLang() lang: string) {
    return this.auditService.findOne(id, lang);
  }

  @Delete(':id')
  @RequirePermissions('audit:delete')
  @ApiOperation({ summary: 'Xóa 1 bản ghi nhật ký' })
  async remove(@Param('id') id: string, @I18nLang() lang: string) {
    return this.auditService.remove(id, lang);
  }
}
