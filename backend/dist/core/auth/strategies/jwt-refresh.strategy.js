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
exports.JwtRefreshStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const nestjs_i18n_1 = require("nestjs-i18n");
const custom_api_exception_1 = require("../../../common/exceptions/custom-api.exception");
const error_code_enum_1 = require("../../../common/enums/error-code.enum");
let JwtRefreshStrategy = class JwtRefreshStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt-refresh') {
    configService;
    i18n;
    constructor(configService, i18n) {
        const cookieName = configService.get('auth.cookieName') || 'ecomcx_session';
        const jwtRefreshSecret = configService.get('auth.jwtRefreshSecret');
        if (!jwtRefreshSecret) {
            throw new Error('CRITICAL SECURITY FAIL: JWT_REFRESH_SECRET environment variable is missing!');
        }
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromExtractors([
                (req) => req?.cookies?.[cookieName],
                passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: jwtRefreshSecret,
            passReqToCallback: true,
        });
        this.configService = configService;
        this.i18n = i18n;
    }
    async validate(req, payload) {
        const lang = nestjs_i18n_1.I18nContext.current()?.lang;
        const cookieName = this.configService.get('auth.cookieName') || 'ecomcx_session';
        const refreshToken = req.cookies?.[cookieName] ||
            req.get('Authorization')?.replace('Bearer', '').trim();
        if (!refreshToken) {
            const message = this.i18n.t('auth.REFRESH_TOKEN_MISSING', { lang, defaultValue: 'Refresh token không tồn tại' });
            throw new custom_api_exception_1.CustomApiException(error_code_enum_1.ErrorCode.AUTH_REFRESH_TOKEN_MISSING, message, common_1.HttpStatus.UNAUTHORIZED);
        }
        return {
            id: payload.sub || payload.id,
            email: payload.email,
            roles: payload.roles || [],
            permissions: payload.permissions || [],
            refreshToken,
        };
    }
};
exports.JwtRefreshStrategy = JwtRefreshStrategy;
exports.JwtRefreshStrategy = JwtRefreshStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        nestjs_i18n_1.I18nService])
], JwtRefreshStrategy);
//# sourceMappingURL=jwt-refresh.strategy.js.map