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
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notification_service_1 = require("./notification.service");
const create_notification_dto_1 = require("./dto/create-notification.dto");
const query_notification_dto_1 = require("./dto/query-notification.dto");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const permission_guard_1 = require("../../core/auth/guards/permission.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const nestjs_i18n_1 = require("nestjs-i18n");
let NotificationController = class NotificationController {
    notificationService;
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async findAll(user, query) {
        return this.notificationService.findAllForUser(user.id, query);
    }
    async markAsRead(id, user, lang) {
        return this.notificationService.markAsRead(id, user.id, lang);
    }
    async markAllAsRead(user) {
        return this.notificationService.markAllAsRead(user.id);
    }
    async sendTestNotification(dto, lang) {
        return this.notificationService.create(dto, lang);
    }
    async remove(id, lang) {
        return this.notificationService.remove(id, lang);
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('notification:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách thông báo của người dùng' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_notification_dto_1.QueryNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    (0, permissions_decorator_1.RequirePermissions)('notification:write'),
    (0, swagger_1.ApiOperation)({ summary: 'Đánh dấu 1 thông báo là đã đọc' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, nestjs_i18n_1.I18nLang)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Patch)('read-all'),
    (0, permissions_decorator_1.RequirePermissions)('notification:write'),
    (0, swagger_1.ApiOperation)({ summary: 'Đánh dấu tất cả thông báo là đã đọc' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Post)('test'),
    (0, permissions_decorator_1.RequirePermissions)('notification:write'),
    (0, swagger_1.ApiOperation)({ summary: 'Gửi thông báo thử nghiệm (Realtime Test Endpoint)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, nestjs_i18n_1.I18nLang)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_notification_dto_1.CreateNotificationDto, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "sendTestNotification", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('notification:delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa 1 thông báo' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, nestjs_i18n_1.I18nLang)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "remove", null);
exports.NotificationController = NotificationController = __decorate([
    (0, swagger_1.ApiTags)('Notification Management'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permission_guard_1.PermissionGuard),
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationController);
//# sourceMappingURL=notification.controller.js.map