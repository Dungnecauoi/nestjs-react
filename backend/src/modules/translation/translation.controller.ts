import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TranslationService } from './translation.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../core/auth/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Translation Manager')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('translations')
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Get('domains')
  @RequirePermissions('translation:read')
  @ApiOperation({ summary: 'Lấy danh sách các Scopes & Domains tệp dịch' })
  getDomains() {
    return this.translationService.getDomains();
  }

  @Post('languages')
  @RequirePermissions('translation:create')
  @ApiOperation({ summary: 'Thêm và khởi tạo gói ngôn ngữ mới (Dynamic Language Clone)' })
  addLanguage(@Body() dto: { code: string; name?: string; cloneFrom?: string }) {
    return this.translationService.addLanguage(dto);
  }

  @Delete('languages/:code')
  @RequirePermissions('translation:delete')
  @ApiOperation({ summary: 'Xóa gói ngôn ngữ khỏi hệ thống' })
  deleteLanguage(@Param('code') code: string) {
    return this.translationService.deleteLanguage(code);
  }

  @Get(':scope/:domain')
  @RequirePermissions('translation:read')
  @ApiOperation({ summary: 'Lấy danh sách Key-Value từ tệp dịch' })
  getTranslations(
    @Param('scope') scope: string,
    @Param('domain') domain: string,
    @Query('lang') lang: string,
  ) {
    return this.translationService.getTranslations(scope, domain, lang || 'vi');
  }

  @Put(':scope/:domain')
  @RequirePermissions('translation:update')
  @ApiOperation({ summary: 'Cập nhật tệp từ điển i18n' })
  updateTranslations(
    @Param('scope') scope: string,
    @Param('domain') domain: string,
    @Query('lang') lang: string,
    @Body() payload: Record<string, string>,
  ) {
    return this.translationService.updateTranslations(scope, domain, lang || 'vi', payload);
  }
}
