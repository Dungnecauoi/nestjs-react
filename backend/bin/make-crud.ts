import * as fs from 'fs';
import * as path from 'path';

const moduleName = process.argv[2];

if (!moduleName) {
  console.error('Vui lòng cung cấp tên module! Ví dụ: npm run make:crud employee');
  process.exit(1);
}

const lowercaseName = moduleName.toLowerCase();
const capitalName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
const rootDir = path.join(__dirname, '..');
const targetDir = path.join(rootDir, `src/modules/${lowercaseName}`);

if (fs.existsSync(targetDir)) {
  console.error(`Module "${lowercaseName}" đã tồn tại!`);
  process.exit(1);
}

fs.mkdirSync(targetDir, { recursive: true });
fs.mkdirSync(path.join(targetDir, 'dto'), { recursive: true });

// 1. TỰ ĐỘNG THÊM FILE I18N CHO MODULE MỚI (Tiếng Việt & Tiếng Anh)
const i18nViDir = path.join(rootDir, 'src/i18n/vi');
const i18nEnDir = path.join(rootDir, 'src/i18n/en');
fs.mkdirSync(i18nViDir, { recursive: true });
fs.mkdirSync(i18nEnDir, { recursive: true });

const i18nViContent = {
  title: `Danh sách ${lowercaseName}`,
  create: `Tạo mới ${lowercaseName}`,
  update: `Cập nhật ${lowercaseName}`,
  delete: `Xóa ${lowercaseName}`,
  not_found: `Không tìm thấy ${lowercaseName} với ID: {id}`,
  delete_success: `Đã xóa ${lowercaseName} thành công`,
};

const i18nEnContent = {
  title: `Manage ${capitalName}`,
  create: `Create ${capitalName}`,
  update: `Update ${capitalName}`,
  delete: `Delete ${capitalName}`,
  not_found: `${capitalName} not found with ID: {id}`,
  delete_success: `${capitalName} deleted successfully`,
};

fs.writeFileSync(path.join(i18nViDir, `${lowercaseName}.json`), JSON.stringify(i18nViContent, null, 2));
fs.writeFileSync(path.join(i18nEnDir, `${lowercaseName}.json`), JSON.stringify(i18nEnContent, null, 2));

// 2. Create DTO với i18n
const createDtoContent = `import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

export class Create${capitalName}Dto {
  @ApiProperty({ description: 'Tên ${lowercaseName}' })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.NOT_EMPTY') })
  name: string;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsOptional()
  description?: string;
}
`;

fs.writeFileSync(path.join(targetDir, `dto/create-${lowercaseName}.dto.ts`), createDtoContent);

// 3. Service Content với i18n
const serviceContent = `import { Injectable, NotFoundException } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { Create${capitalName}Dto } from './dto/create-${lowercaseName}.dto';

@Injectable()
export class ${capitalName}Service {
  private items: any[] = [];

  constructor(private readonly i18n: I18nService) {}

  findAll() {
    return this.items;
  }

  findOne(id: string) {
    const lang = I18nContext.current()?.lang;
    const item = this.items.find((i) => i.id === id);
    if (!item) {
      const message = this.i18n.t('${lowercaseName}.not_found', { lang, args: { id } });
      throw new NotFoundException(message);
    }
    return item;
  }

  create(dto: Create${capitalName}Dto, file?: Express.Multer.File) {
    const newItem = {
      id: Date.now().toString(),
      ...dto,
      avatar: file ? \`/uploads/\${file.filename}\` : null,
      createdAt: new Date().toISOString(),
    };
    this.items.push(newItem);
    return newItem;
  }

  remove(id: string) {
    this.findOne(id);
    this.items = this.items.filter((i) => i.id !== id);
    const lang = I18nContext.current()?.lang;
    return { message: this.i18n.t('${lowercaseName}.delete_success', { lang }) };
  }
}
`;

fs.writeFileSync(path.join(targetDir, `${lowercaseName}.service.ts`), serviceContent);

// 4. Controller Content với Phân quyền & i18n
const controllerContent = `import {
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
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { ${capitalName}Service } from './${lowercaseName}.service';
import { Create${capitalName}Dto } from './dto/create-${lowercaseName}.dto';
import { StorageService } from '../../core/storage/storage.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../core/auth/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('${capitalName} Module')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('${lowercaseName}s')
export class ${capitalName}Controller {
  constructor(private readonly ${lowercaseName}Service: ${capitalName}Service) {}

  @Get()
  @RequirePermissions('${lowercaseName}:read')
  @ApiOperation({ summary: 'Lấy danh sách ${lowercaseName}' })
  findAll() {
    return this.${lowercaseName}Service.findAll();
  }

  @Get(':id')
  @RequirePermissions('${lowercaseName}:read')
  @ApiOperation({ summary: 'Lấy chi tiết ${lowercaseName}' })
  findOne(@Param('id') id: string) {
    return this.${lowercaseName}Service.findOne(id);
  }

  @Post()
  @RequirePermissions('${lowercaseName}:create')
  @ApiOperation({ summary: 'Tạo mới ${lowercaseName}' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar', StorageService.getMulterConfig('${lowercaseName}s')))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: Create${capitalName}Dto,
  ) {
    return this.${lowercaseName}Service.create(dto, file);
  }

  @Delete(':id')
  @RequirePermissions('${lowercaseName}:delete')
  @ApiOperation({ summary: 'Xóa ${lowercaseName}' })
  remove(@Param('id') id: string) {
    return this.${lowercaseName}Service.remove(id);
  }
}
`;

fs.writeFileSync(path.join(targetDir, `${lowercaseName}.controller.ts`), controllerContent);

// 5. Module Content
const moduleContent = `import { Module } from '@nestjs/common';
import { ${capitalName}Controller } from './${lowercaseName}.controller';
import { ${capitalName}Service } from './${lowercaseName}.service';

@Module({
  controllers: [${capitalName}Controller],
  providers: [${capitalName}Service],
  exports: [${capitalName}Service],
})
export class ${capitalName}Module {}
`;

fs.writeFileSync(path.join(targetDir, `${lowercaseName}.module.ts`), moduleContent);

console.log(`Đã khởi tạo thành công CRUD Module "${capitalName}" tích hợp 100% i18n key tự động tại:`);
console.log(`- Backend Module: src/modules/${lowercaseName}`);
console.log(`- i18n Vi File: src/i18n/vi/${lowercaseName}.json`);
console.log(`- i18n En File: src/i18n/en/${lowercaseName}.json`);
