import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
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
  ApiSecurity,
} from '@nestjs/swagger';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { Throttle } from '@nestjs/throttler';
import { MediaService } from './media.service';
import { QueryMediaDto } from './dto/query-media.dto';
import {
  InitChunkUploadDto,
  UploadChunkDto,
  CompleteChunkUploadDto,
} from './dto/chunk-upload.dto';
import { JwtOrApiKeyGuard } from '../../core/auth/guards/jwt-or-api-key.guard';
import { PermissionGuard } from '../../core/auth/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CustomApiException } from '../../common/exceptions/custom-api.exception';
import { ErrorCode } from '../../common/enums/error-code.enum';
import { StorageService } from '../../core/storage/storage.service';

@ApiTags('Media Manager Module')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtOrApiKeyGuard, PermissionGuard)
@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly i18n: I18nService,
  ) {}

  // API key (m2m) trả về id của record ApiKey, không phải id của bảng User — không được
  // gán thẳng vào Media.createdById kẻo gán nhầm chủ sở hữu. Chỉ user đăng nhập JWT thật
  // mới được gán attribution.
  private resolveCreatedById(user: any): string | undefined {
    return user && !user.isApiKey ? user.id : undefined;
  }

  @Get()
  @RequirePermissions('media:read')
  @ApiOperation({ summary: 'Lấy danh sách tập tin Media (Phân trang Server-side)' })
  async findAll(@Query() query: QueryMediaDto) {
    return this.mediaService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('media:read')
  @ApiOperation({ summary: 'Lấy chi tiết tập tin Media theo ID' })
  async findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id);
  }

  @Post('upload')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @RequirePermissions('media:create')
  @UseInterceptors(FileInterceptor('file', StorageService.getMulterConfig()))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Tải lên 1 tập tin Media mới' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
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
    return this.mediaService.createMedia(file, this.resolveCreatedById(user));
  }

  @Post('upload-multiple')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @RequirePermissions('media:create')
  @UseInterceptors(
    FilesInterceptor('files', 10, StorageService.getMulterConfig()),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Tải lên nhiều tập tin Media cùng lúc (Tối đa 10)' })
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: any,
  ) {
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
    const createdById = this.resolveCreatedById(user);
    const promises = files.map((file) => this.mediaService.createMedia(file, createdById));
    return Promise.all(promises);
  }

  @Post('upload-chunk/init')
  @RequirePermissions('media:create')
  @ApiOperation({ summary: 'Khởi tạo phiên upload-chunk tệp lớn (Init Chunked Upload)' })
  async initChunkUpload(@Body() dto: InitChunkUploadDto, @CurrentUser() user: any) {
    return this.mediaService.initChunkUpload(dto, this.resolveCreatedById(user));
  }

  @Post('upload-chunk/chunk')
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @RequirePermissions('media:create')
  @UseInterceptors(FileInterceptor('chunk', StorageService.getMulterConfig()))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Tải lên 1 mảnh chunk của tệp lớn' })
  async uploadChunkSlice(
    @UploadedFile() chunk: Express.Multer.File,
    @Body() dto: UploadChunkDto,
    @CurrentUser() user: any,
  ) {
    if (!chunk) {
      throw new CustomApiException(
        ErrorCode.MEDIA_TYPE_NOT_ALLOWED,
        'Thiếu file chunk',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.mediaService.saveChunkSlice(
      chunk,
      dto.uploadId,
      dto.chunkIndex,
      this.resolveCreatedById(user),
    );
  }

  @Post('upload-chunk/complete')
  @RequirePermissions('media:create')
  @ApiOperation({ summary: 'Hoàn tất ghép nối tất cả mảnh chunk thành tệp Media hoàn chỉnh' })
  async completeChunkUpload(@Body() dto: CompleteChunkUploadDto, @CurrentUser() user: any) {
    return this.mediaService.completeChunkUpload(dto.uploadId, this.resolveCreatedById(user));
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
  @ApiOperation({ summary: 'Xóa tập tin Media (Soft Delete)' })
  async removeMedia(@Param('id') id: string) {
    return this.mediaService.removeMedia(id);
  }

  @Post(':id/restore')
  @RequirePermissions('media:delete')
  @ApiOperation({ summary: 'Khôi phục tập tin Media đã xóa (Soft Delete)' })
  async restoreMedia(@Param('id') id: string) {
    return this.mediaService.restore(id);
  }
}
