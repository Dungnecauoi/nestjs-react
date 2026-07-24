import { Injectable, HttpStatus } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { Request } from 'express';
import { CustomApiException } from '../../../common/exceptions/custom-api.exception';
import { ErrorCode } from '../../../common/enums/error-code.enum';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
  ) {
    const cookieName =
      configService.get<string>('auth.cookieName') || 'ecomcx_session';
    const jwtRefreshSecret = configService.get<string>('auth.jwtRefreshSecret');
    if (!jwtRefreshSecret) {
      throw new Error(
        'CRITICAL SECURITY FAIL: JWT_REFRESH_SECRET environment variable is missing!',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.[cookieName],
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtRefreshSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const lang = I18nContext.current()?.lang;
    const cookieName =
      this.configService.get<string>('auth.cookieName') || 'ecomcx_session';
    const refreshToken =
      req.cookies?.[cookieName] ||
      req.get('Authorization')?.replace('Bearer', '').trim();

    if (!refreshToken) {
      const message = this.i18n.t('auth.REFRESH_TOKEN_MISSING', {
        lang,
        defaultValue: 'Refresh token không tồn tại',
      });
      throw new CustomApiException(
        ErrorCode.AUTH_REFRESH_TOKEN_MISSING,
        message,
        HttpStatus.UNAUTHORIZED,
      );
    }

    return {
      id: payload.sub || payload.id,
      email: payload.email,
      roles: payload.roles || [],
      permissions: payload.permissions || [],
      refreshToken,
    };
  }
}
