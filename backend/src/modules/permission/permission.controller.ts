import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../core/auth/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Permission Catalog Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @RequirePermissions('role:manage')
  @ApiOperation({ summary: 'Lấy danh sách tất cả Quyền hạn (Gom nhóm theo Module cho UI)' })
  findAll() {
    return this.permissionService.findAll();
  }

  @Post()
  @RequirePermissions('role:manage')
  @ApiOperation({ summary: 'Tạo mới Quyền hạn' })
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionService.create(dto);
  }
}
