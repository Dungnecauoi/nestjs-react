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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { QueryDepartmentDto } from './dto/query-department.dto';
import { JwtOrApiKeyGuard } from '../../core/auth/guards/jwt-or-api-key.guard';
import { PermissionGuard } from '../../core/auth/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Department & Team Management')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtOrApiKeyGuard, PermissionGuard)
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  @RequirePermissions('department:read')
  @ApiOperation({
    summary: 'Lấy danh sách Phòng ban / Team (Phân trang Server-side)',
  })
  findAll(@Query() query: QueryDepartmentDto) {
    return this.departmentService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('department:read')
  @ApiOperation({
    summary: 'Lấy chi tiết Phòng ban / Team (Yêu cầu quyền: department:read)',
  })
  findOne(@Param('id') id: string) {
    return this.departmentService.findOne(id);
  }

  @Post()
  @RequirePermissions('department:create')
  @ApiOperation({
    summary: 'Tạo mới Phòng ban / Team (Yêu cầu quyền: department:create)',
  })
  create(@Body() dto: CreateDepartmentDto) {
    return this.departmentService.create(dto);
  }

  @Put(':id')
  @RequirePermissions('department:update')
  @ApiOperation({
    summary: 'Cập nhật Phòng ban / Team (Yêu cầu quyền: department:update)',
  })
  update(@Param('id') id: string, @Body() dto: Partial<CreateDepartmentDto>) {
    return this.departmentService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('department:delete')
  @ApiOperation({
    summary:
      'Xóa Phòng ban / Team - Soft Delete (Yêu cầu quyền: department:delete)',
  })
  remove(@Param('id') id: string) {
    return this.departmentService.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('department:delete')
  @ApiOperation({
    summary:
      'Khôi phục Phòng ban / Team đã xóa (Yêu cầu quyền: department:delete)',
  })
  restore(@Param('id') id: string) {
    return this.departmentService.restore(id);
  }
}
