import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';

@ApiTags('API Key Management Module')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('api-keys')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Get()
  @RequirePermissions('setting:read')
  @ApiOperation({ summary: 'Lấy danh sách các API Key tích hợp' })
  findAll() {
    return this.apiKeyService.findAll();
  }

  @Post()
  @RequirePermissions('setting:update')
  @ApiOperation({ summary: 'Tạo API Key tích hợp mới' })
  create(@Body() dto: CreateApiKeyDto) {
    return this.apiKeyService.create(dto);
  }

  @Patch(':id/revoke')
  @RequirePermissions('setting:update')
  @ApiOperation({ summary: 'Vô hiệu hóa (Revoke) API Key' })
  revoke(@Param('id') id: string) {
    return this.apiKeyService.revoke(id);
  }

  @Patch(':id/restore')
  @RequirePermissions('setting:update')
  @ApiOperation({ summary: 'Kích hoạt lại API Key đã vô hiệu hóa' })
  restore(@Param('id') id: string) {
    return this.apiKeyService.restore(id);
  }

  @Delete(':id')
  @RequirePermissions('setting:update')
  @ApiOperation({ summary: 'Xóa vĩnh viễn API Key' })
  delete(@Param('id') id: string) {
    return this.apiKeyService.delete(id);
  }
}
