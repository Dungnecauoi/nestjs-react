import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignUserRolesDto } from './dto/assign-user-roles.dto';
import { AssignUserPermissionsDto } from './dto/assign-user-permissions.dto';
import { AssignUserDepartmentsDto } from './dto/assign-user-departments.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../core/auth/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('User Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @RequirePermissions('user:read')
  @ApiOperation({ summary: 'Lấy danh sách User kèm Roles, Direct Permissions & Departments' })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @RequirePermissions('user:read')
  @ApiOperation({ summary: 'Lấy chi tiết User kèm Roles & Permissions' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  @RequirePermissions('user:create')
  @ApiOperation({ summary: 'Tạo mới User kèm thông tin định danh CCCD, Giới tính, Ngày sinh, Địa chỉ' })
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('user:write')
  @ApiOperation({ summary: 'Cập nhật thông tin User' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('user:delete')
  @ApiOperation({ summary: 'Xóa User' })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Patch(':id/approve')
  @RequirePermissions('user:write')
  @ApiOperation({ summary: 'Phê duyệt Kích hoạt User' })
  approve(@Param('id') id: string) {
    return this.userService.approve(id);
  }

  @Post(':id/roles')
  @RequirePermissions('role:write')
  @ApiOperation({ summary: 'Gán mảng Vai trò (Roles) cho User từ UI' })
  assignRoles(@Param('id') id: string, @Body() dto: AssignUserRolesDto) {
    return this.userService.assignRoles(id, dto);
  }

  @Post(':id/permissions')
  @RequirePermissions('role:write')
  @ApiOperation({ summary: 'Gán mảng Quyền hạn (Permissions) TRỰC TIẾP cho User từ UI' })
  assignDirectPermissions(@Param('id') id: string, @Body() dto: AssignUserPermissionsDto) {
    return this.userService.assignDirectPermissions(id, dto);
  }

  @Post(':id/departments')
  @RequirePermissions('department:write')
  @ApiOperation({ summary: 'Gán User vào mảng Phòng ban / Team từ UI' })
  assignDepartments(@Param('id') id: string, @Body() dto: AssignUserDepartmentsDto) {
    return this.userService.assignDepartments(id, dto);
  }
}
