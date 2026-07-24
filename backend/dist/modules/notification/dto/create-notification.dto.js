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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateNotificationDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const nestjs_i18n_1 = require("nestjs-i18n");
class CreateNotificationDto {
    userId;
    title;
    content;
    type;
    data;
}
exports.CreateNotificationDto = CreateNotificationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'user-uuid-123', description: 'ID người nhận thông báo (Để trống nếu gửi toàn hệ thống)' }),
    (0, class_validator_1.IsString)({ message: (0, nestjs_i18n_1.i18nValidationMessage)('validation.IS_STRING') }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Đăng nhập thiết bị mới', description: 'Tiêu đề thông báo' }),
    (0, class_validator_1.IsString)({ message: (0, nestjs_i18n_1.i18nValidationMessage)('validation.IS_STRING') }),
    (0, class_validator_1.IsNotEmpty)({ message: (0, nestjs_i18n_1.i18nValidationMessage)('validation.NOT_EMPTY') }),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Tài khoản của bạn vừa đăng nhập từ IP 192.168.1.1', description: 'Nội dung thông báo' }),
    (0, class_validator_1.IsString)({ message: (0, nestjs_i18n_1.i18nValidationMessage)('validation.IS_STRING') }),
    (0, class_validator_1.IsNotEmpty)({ message: (0, nestjs_i18n_1.i18nValidationMessage)('validation.NOT_EMPTY') }),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'info', enum: ['info', 'success', 'warning', 'error', 'system'], description: 'Loại thông báo' }),
    (0, class_validator_1.IsIn)(['info', 'success', 'warning', 'error', 'system']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '{"link":"/admin/users/123"}', description: 'JSON metadata đính kèm' }),
    (0, class_validator_1.IsString)({ message: (0, nestjs_i18n_1.i18nValidationMessage)('validation.IS_STRING') }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "data", void 0);
//# sourceMappingURL=create-notification.dto.js.map