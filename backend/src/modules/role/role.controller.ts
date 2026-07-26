import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignPermissionsToRoleDto } from './dto/assign-permissions-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../core/auth/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Role Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @RequirePermissions('role:read')
  @ApiOperation({ summary: 'Lấy danh sách Role kèm Quyền hạn (Phân trang Server-side)' })
  findAll(@Query() query: QueryRoleDto) {
    return this.roleService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('role:read')
  @ApiOperation({ summary: 'Lấy chi tiết Role' })
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Post()
  @RequirePermissions('role:create')
  @ApiOperation({ summary: 'Tạo mới Role' })
  create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto);
  }

  @Put(':id')
  @RequirePermissions('role:update')
  @ApiOperation({ summary: 'Cập nhật Role' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateRoleDto>) {
    return this.roleService.update(id, dto);
  }

  @Post(':id/permissions')
  @RequirePermissions('role:update')
  @ApiOperation({
    summary: 'Gán danh sách Quyền hạn (Permissions) vào Role từ giao diện UI',
  })
  assignPermissions(
    @Param('id') id: string,
    @Body() dto: AssignPermissionsToRoleDto,
  ) {
    return this.roleService.assignPermissions(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('role:delete')
  @ApiOperation({ summary: 'Xóa Role (Soft Delete)' })
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('role:delete')
  @ApiOperation({ summary: 'Khôi phục Role đã xóa (Soft Delete)' })
  restore(@Param('id') id: string) {
    return this.roleService.restore(id);
  }
}
