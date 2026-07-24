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
exports.OptionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const options_service_1 = require("./options.service");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let OptionsController = class OptionsController {
    optionsService;
    constructor(optionsService) {
        this.optionsService = optionsService;
    }
    async getAllOptions() {
        const data = await this.optionsService.getAllOptions();
        return {
            success: true,
            data,
        };
    }
    async setOptions(options) {
        const updated = await this.optionsService.setMultipleOptions(options);
        return {
            success: true,
            message: 'Đã lưu cấu hình hệ thống vào Database thành công!',
            data: updated,
        };
    }
};
exports.OptionsController = OptionsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy toàn bộ cấu hình hệ thống (wp_options architecture)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OptionsController.prototype, "getAllOptions", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lưu hoặc cập nhật hàng loạt cấu hình hệ thống vào Database' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OptionsController.prototype, "setOptions", null);
exports.OptionsController = OptionsController = __decorate([
    (0, swagger_1.ApiTags)('Options & System Settings Module'),
    (0, common_1.Controller)('options'),
    __metadata("design:paramtypes", [options_service_1.OptionsService])
], OptionsController);
//# sourceMappingURL=options.controller.js.map