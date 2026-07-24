"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const nestjs_i18n_1 = require("nestjs-i18n");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../database/prisma.service");
const two_factor_service_1 = require("./two-factor.service");
const custom_api_exception_1 = require("../../common/exceptions/custom-api.exception");
const error_code_enum_1 = require("../../common/enums/error-code.enum");
let AuthService = class AuthService {
    jwtService;
    configService;
    i18n;
    prisma;
    twoFactorService;
    userIncludeRelations = {
        roles: {
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        },
        permissions: {
            include: {
                permission: true,
            },
        },
    };
    constructor(jwtService, configService, i18n, prisma, twoFactorService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.i18n = i18n;
        this.prisma = prisma;
        this.twoFactorService = twoFactorService;
    }
    extractUserPermissionsAndRoles(dbUser) {
        const roles = dbUser.roles ? dbUser.roles.map((r) => r.role.code) : [];
        const rolePermissions = dbUser.roles
            ? dbUser.roles.flatMap((r) => r.role.permissions.map((p) => p.permission.code))
            : [];
        const directPermissions = dbUser.permissions
            ? dbUser.permissions.map((p) => p.permission.code)
            : [];
        const permissions = Array.from(new Set([...rolePermissions, ...directPermissions]));
        return { roles, permissions };
    }
    async login(dto, meta) {
        const lang = nestjs_i18n_1.I18nContext.current()?.lang;
        const dbUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: this.userIncludeRelations,
        });
        if (!dbUser || !dbUser.isActive) {
            const message = this.i18n.t('auth.LOGIN_FAILED', { lang });
            throw new custom_api_exception_1.CustomApiException(error_code_enum_1.ErrorCode.AUTH_LOGIN_FAILED, message, common_1.HttpStatus.UNAUTHORIZED);
        }
        const isPasswordValid = await bcrypt.compare(dto.password, dbUser.password);
        if (!isPasswordValid) {
            const message = this.i18n.t('auth.LOGIN_FAILED', { lang });
            throw new custom_api_exception_1.CustomApiException(error_code_enum_1.ErrorCode.AUTH_LOGIN_FAILED, message, common_1.HttpStatus.UNAUTHORIZED);
        }
        const { roles, permissions } = this.extractUserPermissionsAndRoles(dbUser);
        if (dbUser.isTwoFactorEnabled) {
            const preAuthToken = await this.jwtService.signAsync({ sub: dbUser.id, email: dbUser.email, isPreAuth: true }, { expiresIn: '5m' });
            const message = this.i18n.t('auth.TWO_FACTOR_REQUIRED', { lang });
            return {
                isTwoFactorRequired: true,
                preAuthToken,
                message,
            };
        }
        const payload = {
            sub: dbUser.id,
            email: dbUser.email,
            roles,
            permissions,
        };
        const tokens = await this.generateTokens(payload);
        const tokenHash = await bcrypt.hash(tokens.refreshToken, 10);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await this.prisma.userSession.create({
            data: {
                userId: dbUser.id,
                tokenHash,
                userAgent: meta?.userAgent || 'Unknown Device',
                ipAddress: meta?.ipAddress || '127.0.0.1',
                expiresAt,
            },
        });
        return {
            isTwoFactorRequired: false,
            user: {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                roles,
                permissions,
                isTwoFactorEnabled: dbUser.isTwoFactorEnabled,
            },
            ...tokens,
        };
    }
    async authenticate2FA(preAuthToken, otpCode, meta) {
        const lang = nestjs_i18n_1.I18nContext.current()?.lang;
        let decoded;
        try {
            decoded = await this.jwtService.verifyAsync(preAuthToken);
        }
        catch {
            const message = this.i18n.t('auth.TWO_FACTOR_EXPIRED', { lang });
            throw new custom_api_exception_1.CustomApiException(error_code_enum_1.ErrorCode.AUTH_2FA_EXPIRED, message, common_1.HttpStatus.UNAUTHORIZED);
        }
        const dbUser = await this.prisma.user.findUnique({
            where: { email: decoded.email },
            include: this.userIncludeRelations,
        });
        if (!dbUser || !dbUser.isActive) {
            const message = this.i18n.t('auth.LOGIN_FAILED', { lang });
            throw new custom_api_exception_1.CustomApiException(error_code_enum_1.ErrorCode.AUTH_LOGIN_FAILED, message, common_1.HttpStatus.UNAUTHORIZED);
        }
        if (!dbUser.twoFactorSecret) {
            const message = this.i18n.t('auth.TWO_FACTOR_INVALID', { lang });
            throw new custom_api_exception_1.CustomApiException(error_code_enum_1.ErrorCode.AUTH_2FA_INVALID, message, common_1.HttpStatus.BAD_REQUEST);
        }
        const isValid = this.twoFactorService.verifyCode(dbUser.twoFactorSecret, otpCode);
        if (!isValid) {
            const message = this.i18n.t('auth.TWO_FACTOR_INVALID', { lang });
            throw new custom_api_exception_1.CustomApiException(error_code_enum_1.ErrorCode.AUTH_2FA_INVALID, message, common_1.HttpStatus.BAD_REQUEST);
        }
        const { roles, permissions } = this.extractUserPermissionsAndRoles(dbUser);
        const payload = {
            sub: dbUser.id,
            email: dbUser.email,
            roles,
            permissions,
        };
        const tokens = await this.generateTokens(payload);
        const tokenHash = await bcrypt.hash(tokens.refreshToken, 10);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await this.prisma.userSession.create({
            data: {
                userId: dbUser.id,
                tokenHash,
                userAgent: meta?.userAgent || 'Unknown Device',
                ipAddress: meta?.ipAddress || '127.0.0.1',
                expiresAt,
            },
        });
        return {
            user: {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                roles,
                permissions,
                isTwoFactorEnabled: dbUser.isTwoFactorEnabled,
            },
            ...tokens,
        };
    }
    async generate2FASecret(email) {
        const secret = this.twoFactorService.generateSecret();
        const otpAuthUrl = this.twoFactorService.generateOtpauthUrl(email, secret);
        return {
            secret,
            otpAuthUrl,
        };
    }
    async turnOn2FA(email, otpCode) {
        const lang = nestjs_i18n_1.I18nContext.current()?.lang;
        const dbUser = await this.prisma.user.findUnique({ where: { email } });
        if (!dbUser) {
            const message = this.i18n.t('auth.UNAUTHORIZED', { lang });
            throw new custom_api_exception_1.CustomApiException(error_code_enum_1.ErrorCode.AUTH_UNAUTHORIZED, message, common_1.HttpStatus.UNAUTHORIZED);
        }
        const secret = dbUser.twoFactorSecret;
        if (!secret) {
            const message = this.i18n.t('auth.TWO_FACTOR_INVALID', { lang });
            throw new custom_api_exception_1.CustomApiException(error_code_enum_1.ErrorCode.AUTH_2FA_INVALID, message, common_1.HttpStatus.BAD_REQUEST);
        }
        const isValid = this.twoFactorService.verifyCode(secret, otpCode);
        if (!isValid) {
            const message = this.i18n.t('auth.TWO_FACTOR_INVALID', { lang });
            throw new custom_api_exception_1.CustomApiException(error_code_enum_1.ErrorCode.AUTH_2FA_INVALID, message, common_1.HttpStatus.BAD_REQUEST);
        }
        await this.prisma.user.update({
            where: { email },
            data: { isTwoFactorEnabled: true },
        });
        const message = this.i18n.t('auth.TWO_FACTOR_ACTIVATED', { lang });
        return { success: true, message };
    }
    async turnOff2FA(email) {
        const lang = nestjs_i18n_1.I18nContext.current()?.lang;
        const dbUser = await this.prisma.user.findUnique({ where: { email } });
        if (!dbUser) {
            const message = this.i18n.t('auth.UNAUTHORIZED', { lang });
            throw new custom_api_exception_1.CustomApiException(error_code_enum_1.ErrorCode.AUTH_UNAUTHORIZED, message, common_1.HttpStatus.UNAUTHORIZED);
        }
        await this.prisma.user.update({
            where: { email },
            data: { isTwoFactorEnabled: false, twoFactorSecret: null },
        });
        const message = this.i18n.t('auth.TWO_FACTOR_DEACTIVATED', { lang });
        return { success: true, message };
    }
    async refreshToken(user, meta) {
        const userId = user.id || user.sub;
        let dbUser = await this.prisma.user.findUnique({
            where: { id: userId },
            include: this.userIncludeRelations,
        });
        if (!dbUser && user.email) {
            dbUser = await this.prisma.user.findUnique({
                where: { email: user.email },
                include: this.userIncludeRelations,
            });
        }
        if (!dbUser || !dbUser.isActive) {
            const lang = nestjs_i18n_1.I18nContext.current()?.lang;
            const message = this.i18n.t('auth.UNAUTHORIZED', { lang, defaultValue: 'Không có quyền truy cập' });
            throw new custom_api_exception_1.CustomApiException(error_code_enum_1.ErrorCode.AUTH_UNAUTHORIZED, message, common_1.HttpStatus.UNAUTHORIZED);
        }
        const incomingToken = meta?.refreshToken;
        let matchingSession = null;
        if (incomingToken) {
            const activeSessions = await this.prisma.userSession.findMany({
                where: {
                    userId: dbUser.id,
                    isRevoked: false,
                    expiresAt: { gt: new Date() },
                },
            });
            for (const session of activeSessions) {
                const isMatch = await bcrypt.compare(incomingToken, session.tokenHash);
                if (isMatch) {
                    matchingSession = session;
                    break;
                }
            }
        }
        const { roles, permissions } = this.extractUserPermissionsAndRoles(dbUser);
        const payload = {
            sub: dbUser.id,
            email: dbUser.email,
            roles,
            permissions,
        };
        const tokens = await this.generateTokens(payload);
        const newTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
        const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        if (matchingSession) {
            await this.prisma.userSession.update({
                where: { id: matchingSession.id },
                data: {
                    tokenHash: newTokenHash,
                    expiresAt: newExpiresAt,
                    updatedAt: new Date(),
                },
            });
        }
        else {
            await this.prisma.userSession.create({
                data: {
                    userId: dbUser.id,
                    tokenHash: newTokenHash,
                    userAgent: meta?.userAgent || 'Unknown Device',
                    ipAddress: meta?.ipAddress || '127.0.0.1',
                    expiresAt: newExpiresAt,
                },
            });
        }
        return {
            user: {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                roles,
                permissions,
                isTwoFactorEnabled: dbUser.isTwoFactorEnabled,
            },
            ...tokens,
        };
    }
    async logoutSession(userId, refreshToken) {
        if (!userId)
            return;
        if (refreshToken) {
            const activeSessions = await this.prisma.userSession.findMany({
                where: { userId, isRevoked: false },
            });
            for (const session of activeSessions) {
                const isMatch = await bcrypt.compare(refreshToken, session.tokenHash);
                if (isMatch) {
                    await this.prisma.userSession.update({
                        where: { id: session.id },
                        data: { isRevoked: true },
                    });
                    break;
                }
            }
        }
    }
    async generateTokens(payload) {
        const jwtSecret = this.configService.get('auth.jwtSecret');
        const jwtExpiresIn = this.configService.get('auth.jwtExpiresIn') || '1h';
        const jwtRefreshSecret = this.configService.get('auth.jwtRefreshSecret');
        const jwtRefreshExpiresIn = this.configService.get('auth.jwtRefreshExpiresIn') || '7d';
        if (!jwtSecret || !jwtRefreshSecret) {
            throw new custom_api_exception_1.CustomApiException(error_code_enum_1.ErrorCode.SYS_CONFIG_ERROR, 'Cấu hình JWT Secret chưa được khai báo trong hệ thống', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: jwtSecret,
                expiresIn: jwtExpiresIn,
            }),
            this.jwtService.signAsync(payload, {
                secret: jwtRefreshSecret,
                expiresIn: jwtRefreshExpiresIn,
            }),
        ]);
        return {
            accessToken,
            refreshToken,
            tokenType: 'Bearer',
            expiresIn: jwtExpiresIn,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        nestjs_i18n_1.I18nService,
        prisma_service_1.PrismaService,
        two_factor_service_1.TwoFactorService])
], AuthService);
//# sourceMappingURL=auth.service.js.map