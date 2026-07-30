import {
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity, ApiConsumes } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ImportExportService } from './import-export.service';
import { JwtOrApiKeyGuard } from '../../core/auth/guards/jwt-or-api-key.guard';
import { PermissionGuard } from '../../core/auth/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Import & Export Data Module')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtOrApiKeyGuard, PermissionGuard)
@Controller('import-export')
export class ImportExportController {
  constructor(private readonly importExportService: ImportExportService) {}

  // ────────────────────────────────────────────────────
  // CSV Export
  // ────────────────────────────────────────────────────

  @Get('export/users')
  @RequirePermissions('user:read')
  @ApiOperation({ summary: 'Xuất danh sách User ra file CSV' })
  async exportUsers(@Res({ passthrough: true }) res: Response) {
    const csvContent = await this.importExportService.exportUsersToCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=users_export_${Date.now()}.csv`);
    return Buffer.from('\uFEFF' + csvContent, 'utf-8');
  }

  @Get('export/departments')
  @RequirePermissions('department:read')
  @ApiOperation({ summary: 'Xuất danh sách Phòng Ban ra file CSV' })
  async exportDepartments(@Res({ passthrough: true }) res: Response) {
    const csvContent = await this.importExportService.exportDepartmentsToCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=departments_export_${Date.now()}.csv`);
    return Buffer.from('\uFEFF' + csvContent, 'utf-8');
  }

  // ────────────────────────────────────────────────────
  // Excel Export (.xlsx)
  // ────────────────────────────────────────────────────

  @Get('export/users/excel')
  @RequirePermissions('user:read')
  @ApiOperation({ summary: 'Xuất danh sách User ra file Excel (.xlsx) — có định dạng màu sắc, auto-filter' })
  async exportUsersExcel(@Res() res: Response) {
    const buffer = await this.importExportService.exportUsersToExcel();
    const filename = `users_export_${Date.now()}.xlsx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  }

  @Get('export/departments/excel')
  @RequirePermissions('department:read')
  @ApiOperation({ summary: 'Xuất danh sách Phòng Ban ra file Excel (.xlsx)' })
  async exportDepartmentsExcel(@Res() res: Response) {
    const buffer = await this.importExportService.exportDepartmentsToExcel();
    const filename = `departments_export_${Date.now()}.xlsx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  }

  // ────────────────────────────────────────────────────
  // CSV Import
  // ────────────────────────────────────────────────────

  @Post('import/users')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @RequirePermissions('user:create')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Nhập danh sách User mới từ file CSV' })
  async importUsers(@UploadedFile() file: Express.Multer.File) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Vui lòng chọn 1 tập tin CSV để nhập dữ liệu!');
    }
    return this.importExportService.importUsersFromCsv(file.buffer);
  }
}
