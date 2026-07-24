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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const jwt_refresh_guard_1 = require("./guards/jwt-refresh.guard");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
let AuthController = class AuthController {
    authService;
    configService;
    constructor(authService, configService) {
        this.authService = authService;
        this.configService = configService;
    }
    getCookieName() {
        return this.configService.get('auth.cookieName') || 'ecomcx_session';
    }
    getCookieMaxAge() {
        const expiresIn = this.configService.get('auth.jwtRefreshExpiresIn') || '7d';
        if (expiresIn.endsWith('d')) {
            return parseInt(expiresIn, 10) * 24 * 60 * 60 * 1000;
        }
        if (expiresIn.endsWith('h')) {
            return parseInt(expiresIn, 10) * 60 * 60 * 1000;
        }
        if (expiresIn.endsWith('m')) {
            return parseInt(expiresIn, 10) * 60 * 1000;
        }
        return 7 * 24 * 60 * 60 * 1000;
    }
    getCookieOptions() {
        return {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/api/auth',
            maxAge: this.getCookieMaxAge(),
        };
    }
    async login(dto, req, res) {
        const meta = {
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip,
        };
        const result = await this.authService.login(dto, meta);
        if (result && !result.isTwoFactorRequired && 'refreshToken' in result && result.refreshToken) {
            res.cookie(this.getCookieName(), result.refreshToken, this.getCookieOptions());
        }
        return result;
    }
    async authenticate2FA(body, req, res) {
        const meta = {
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip,
        };
        const result = await this.authService.authenticate2FA(body.preAuthToken, body.otpCode, meta);
        if (result && result.refreshToken) {
            res.cookie(this.getCookieName(), result.refreshToken, this.getCookieOptions());
        }
        return result;
    }
    async generate2FASecret(body) {
        return this.authService.generate2FASecret(body.email || 'admin@ecomcx.com');
    }
    async turnOn2FA(body) {
        return this.authService.turnOn2FA(body.email || 'admin@ecomcx.com', body.otpCode);
    }
    async turnOff2FA(body) {
        return this.authService.turnOff2FA(body.email || 'admin@ecomcx.com');
    }
    async refreshToken(user, req, res) {
        const refreshToken = req.cookies?.[this.getCookieName()];
        const meta = {
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip,
            refreshToken,
        };
        const tokens = await this.authService.refreshToken(user, meta);
        if (tokens && tokens.refreshToken) {
            res.cookie(this.getCookieName(), tokens.refreshToken, this.getCookieOptions());
        }
        return tokens;
    }
    async logout(req, res) {
        const refreshToken = req.cookies?.[this.getCookieName()];
        const userId = req.user?.id || req.user?.sub;
        if (userId) {
            await this.authService.logoutSession(userId, refreshToken);
        }
        res.clearCookie(this.getCookieName(), { path: '/api/auth' });
        return { success: true, message: 'Đã đăng xuất thành công' };
    }
    getProfile(user) {
        return {
            message: 'Lấy thông tin tài khoản thành công',
            data: user,
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Đăng nhập hệ thống (Cấp Access Token hoặc Chặn 2FA OTP)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('2fa/authenticate'),
    (0, swagger_1.ApiOperation)({ summary: 'Xác nhận mã 6 số 2FA OTP khi Đăng Nhập' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "authenticate2FA", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('2fa/generate'),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo Secret & QR Code TOTP cho Google Authenticator' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "generate2FASecret", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('2fa/turn-on'),
    (0, swagger_1.ApiOperation)({ summary: 'Xác minh OTP và Kích Hoạt 2FA trong Database' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "turnOn2FA", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('2fa/turn-off'),
    (0, swagger_1.ApiOperation)({ summary: 'Tắt 2FA trong Database' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "turnOff2FA", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.UseGuards)(jwt_refresh_guard_1.JwtRefreshGuard),
    (0, common_1.Post)('refresh'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy Access Token mới bằng Refresh Cookie' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('logout'),
    (0, swagger_1.ApiOperation)({ summary: 'Đăng xuất hệ thống và xóa HttpOnly Refresh Cookie' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy thông tin tài khoản đang đăng nhập' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getProfile", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth Module'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        config_1.ConfigService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map