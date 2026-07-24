"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const nestjs_i18n_1 = require("nestjs-i18n");
const media_service_1 = require("./media.service");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const permission_guard_1 = require("../../core/auth/guards/permission.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const custom_api_exception_1 = require("../../common/exceptions/custom-api.exception");
const error_code_enum_1 = require("../../common/enums/error-code.enum");
let MediaController = class MediaController {
    mediaService;
    i18n;
    constructor(mediaService, i18n) {
        this.mediaService = mediaService;
        this.i18n = i18n;
    }
    async findAll() {
        return this.mediaService.findAll();
    }
    async findOne(id) {
        return this.mediaService.findOne(id);
    }
    async uploadFile(file) {
        if (!file) {
            const lang = nestjs_i18n_1.I18nContext.current()?.lang;
            const message = this.i18n.t('media.FILE_REQUIRED', { lang, defaultValue: 'Vui lòng chọn 1 tập tin để tải lên' });
            throw new custom_api_exception_1.CustomApiException(error_code_enum_1.ErrorCode.MEDIA_TYPE_NOT_ALLOWED, message, common_1.HttpStatus.BAD_REQUEST);
        }
        return this.mediaService.createMedia(file);
    }
    async uploadMultipleFiles(files) {
        if (!files || files.length === 0) {
            const lang = nestjs_i18n_1.I18nContext.current()?.lang;
            const message = this.i18n.t('media.FILE_REQUIRED', { lang, defaultValue: 'Vui lòng chọn ít nhất 1 tập tin' });
            throw new custom_api_exception_1.CustomApiException(error_code_enum_1.ErrorCode.MEDIA_TYPE_NOT_ALLOWED, message, common_1.HttpStatus.BAD_REQUEST);
        }
        const promises = files.map((file) => this.mediaService.createMedia(file));
        return Promise.all(promises);
    }
    async updateMedia(id, dto) {
        return this.mediaService.updateMedia(id, dto);
    }
    async removeMedia(id) {
        return this.mediaService.removeMedia(id);
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('media:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy toàn bộ danh sách tập tin Media' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('media:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết tập tin Media theo ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, permissions_decorator_1.RequirePermissions)('media:create'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Tải lên 1 tập tin Media mới' }),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('upload-multiple'),
    (0, permissions_decorator_1.RequirePermissions)('media:create'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Tải lên nhiều tập tin Media cùng lúc (Tối đa 10)' }),
    __param(0, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "uploadMultipleFiles", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('media:write'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật thông tin Alt Text, Title, Caption của Media' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "updateMedia", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('media:delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa vĩnh viễn tập tin Media khỏi đĩa và Database' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "removeMedia", null);
exports.MediaController = MediaController = __decorate([
    (0, swagger_1.ApiTags)('Media Manager Module'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permission_guard_1.PermissionGuard),
    (0, common_1.Controller)('media'),
    __metadata("design:paramtypes", [media_service_1.MediaService,
        nestjs_i18n_1.I18nService])
], MediaController);
//# sourceMappingURL=media.controller.js.map