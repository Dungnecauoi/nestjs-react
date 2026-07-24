import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../core/auth/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CustomApiException } from '../../common/exceptions/custom-api.exception';
import { ErrorCode } from '../../common/enums/error-code.enum';
import { StorageService } from '../../core/storage/storage.service';

@ApiTags('Media Manager Module')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  @RequirePermissions('media:read')
  @ApiOperation({ summary: 'Lấy toàn bộ danh sách tập tin Media' })
  async findAll() {
    return this.mediaService.findAll();
  }

  @Get(':id')
  @RequirePermissions('media:read')
  @ApiOperation({ summary: 'Lấy chi tiết tập tin Media theo ID' })
  async findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id);
  }

  @Post('upload')
  @RequirePermissions('media:create')
  @UseInterceptors(FileInterceptor('file', StorageService.getMulterConfig()))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Tải lên 1 tập tin Media mới' })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      const lang = I18nContext.current()?.lang;
      const message = this.i18n.t('media.FILE_REQUIRED', {
        lang,
        defaultValue: 'Vui lòng chọn 1 tập tin để tải lên',
      });
      throw new CustomApiException(
        ErrorCode.MEDIA_TYPE_NOT_ALLOWED,
        message,
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.mediaService.createMedia(file);
  }

  @Post('upload-multiple')
  @RequirePermissions('media:create')
  @UseInterceptors(
    FilesInterceptor('files', 10, StorageService.getMulterConfig()),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Tải lên nhiều tập tin Media cùng lúc (Tối đa 10)' })
  async uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      const lang = I18nContext.current()?.lang;
      const message = this.i18n.t('media.FILE_REQUIRED', {
        lang,
        defaultValue: 'Vui lòng chọn ít nhất 1 tập tin',
      });
      throw new CustomApiException(
        ErrorCode.MEDIA_TYPE_NOT_ALLOWED,
        message,
        HttpStatus.BAD_REQUEST,
      );
    }
    const promises = files.map((file) => this.mediaService.createMedia(file));
    return Promise.all(promises);
  }

  @Patch(':id')
  @RequirePermissions('media:update')
  @ApiOperation({
    summary: 'Cập nhật thông tin Alt Text, Title, Caption của Media',
  })
  async updateMedia(
    @Param('id') id: string,
    @Body()
    dto: {
      title?: string;
      altText?: string;
      caption?: string;
      description?: string;
    },
  ) {
    return this.mediaService.updateMedia(id, dto);
  }

  @Patch(':id/replace')
  @RequirePermissions('media:update')
  @UseInterceptors(FileInterceptor('file', StorageService.getMulterConfig()))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Tải lên tập tin mới thay thế tập tin cũ (Replace File)',
  })
  async replaceMediaFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new CustomApiException(
        ErrorCode.MEDIA_TYPE_NOT_ALLOWED,
        'Vui lòng chọn 1 tập tin mới để thay thế',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.mediaService.replaceMediaFile(id, file);
  }

  @Delete(':id')
  @RequirePermissions('media:delete')
  @ApiOperation({ summary: 'Xóa vĩnh viễn tập tin Media khỏi đĩa và Database' })
  async removeMedia(@Param('id') id: string) {
    return this.mediaService.removeMedia(id);
  }
}
