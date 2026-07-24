import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { StorageService } from '../../core/storage/storage.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../core/auth/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Employee Module')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  @Public() // Public route cho phép mọi người xem danh sách demo
  @ApiOperation({ summary: 'Lấy danh sách employee (Public Route Demo)' })
  findAll() {
    return this.employeeService.findAll();
  }

  @Get(':id')
  @RequirePermissions('employee:read')
  @ApiOperation({
    summary: 'Lấy chi tiết employee (Yêu cầu quyền: employee:read)',
  })
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }

  @Post()
  @RequirePermissions('employee:create')
  @ApiOperation({
    summary: 'Tạo mới employee (Yêu cầu quyền: employee:create)',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('avatar', StorageService.getMulterConfig('employees')),
  )
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateEmployeeDto,
  ) {
    return this.employeeService.create(dto, file);
  }

  @Delete(':id')
  @RequirePermissions('employee:delete')
  @ApiOperation({ summary: 'Xóa employee (Yêu cầu quyền: employee:delete)' })
  remove(@Param('id') id: string) {
    return this.employeeService.remove(id);
  }
}
