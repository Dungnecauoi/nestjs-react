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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignUserRolesDto } from './dto/assign-user-roles.dto';
import { AssignUserPermissionsDto } from './dto/assign-user-permissions.dto';
import { AssignUserDepartmentsDto } from './dto/assign-user-departments.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { JwtOrApiKeyGuard } from '../../core/auth/guards/jwt-or-api-key.guard';
import { PermissionGuard } from '../../core/auth/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('User Management')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtOrApiKeyGuard, PermissionGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @RequirePermissions('user:read')
  @ApiOperation({
    summary: 'Lấy danh sách User kèm Roles, Direct Permissions & Departments (Phân trang Server-side)',
  })
  findAll(@Query() query: QueryUserDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('user:read')
  @ApiOperation({ summary: 'Lấy chi tiết User kèm Roles & Permissions' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  @RequirePermissions('user:create')
  @ApiOperation({
    summary:
      'Tạo mới User kèm thông tin định danh CCCD, Giới tính, Ngày sinh, Địa chỉ',
  })
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('user:update')
  @ApiOperation({ summary: 'Cập nhật thông tin User' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('user:delete')
  @ApiOperation({ summary: 'Xóa User (Soft Delete)' })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Patch(':id/restore')
  @RequirePermissions('user:delete')
  @ApiOperation({ summary: 'Khôi phục User đã xóa (Soft Delete)' })
  restore(@Param('id') id: string) {
    return this.userService.restore(id);
  }

  @Patch(':id/approve')
  @RequirePermissions('user:update')
  @ApiOperation({ summary: 'Phê duyệt Kích hoạt User' })
  approve(@Param('id') id: string) {
    return this.userService.approve(id);
  }

  @Post(':id/roles')
  @RequirePermissions('role:update')
  @ApiOperation({ summary: 'Gán mảng Vai trò (Roles) cho User từ UI' })
  assignRoles(@Param('id') id: string, @Body() dto: AssignUserRolesDto) {
    return this.userService.assignRoles(id, dto);
  }

  @Post(':id/permissions')
  @RequirePermissions('role:update')
  @ApiOperation({
    summary: 'Gán mảng Quyền hạn (Permissions) TRỰC TIẾP cho User từ UI',
  })
  assignDirectPermissions(
    @Param('id') id: string,
    @Body() dto: AssignUserPermissionsDto,
  ) {
    return this.userService.assignDirectPermissions(id, dto);
  }

  @Post(':id/departments')
  @RequirePermissions('department:update')
  @ApiOperation({ summary: 'Gán User vào mảng Phòng ban / Team từ UI' })
  assignDepartments(
    @Param('id') id: string,
    @Body() dto: AssignUserDepartmentsDto,
  ) {
    return this.userService.assignDepartments(id, dto);
  }
}
