import { Injectable, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { I18nContext, I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { TwoFactorService } from './two-factor.service';
import { CustomApiException } from '../../common/exceptions/custom-api.exception';
import { ErrorCode } from '../../common/enums/error-code.enum';
import { LoginDto } from './dto/login.dto';

interface SessionMeta {
  userAgent?: string;
  ipAddress?: string;
  refreshToken?: string;
}

@Injectable()
export class AuthService {
  private readonly userIncludeRelations = {
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

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
    private readonly prisma: PrismaService,
    private readonly twoFactorService: TwoFactorService
  ) {}

  private extractUserPermissionsAndRoles(dbUser: any) {
    const roles = dbUser.roles ? dbUser.roles.map((r: any) => r.role.code) : [];
    const rolePermissions = dbUser.roles
      ? dbUser.roles.flatMap((r: any) => r.role.permissions.map((p: any) => p.permission.code))
      : [];
    const directPermissions = dbUser.permissions
      ? dbUser.permissions.map((p: any) => p.permission.code)
      : [];

    const permissions = Array.from(new Set([...rolePermissions, ...directPermissions]));
    return { roles, permissions };
  }

  async login(dto: LoginDto, meta?: SessionMeta) {
    const lang = I18nContext.current()?.lang;

    // 1. Query Real MySQL User with full Roles and Permissions relations
    const dbUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: this.userIncludeRelations,
    });

    if (!dbUser || !dbUser.isActive) {
      const message = this.i18n.t('auth.LOGIN_FAILED', { lang });
      throw new CustomApiException(ErrorCode.AUTH_LOGIN_FAILED, message, HttpStatus.UNAUTHORIZED);
    }

    // 2. Verify Bcrypt Hashed Password
    const isPasswordValid = await bcrypt.compare(dto.password, dbUser.password);
    if (!isPasswordValid) {
      const message = this.i18n.t('auth.LOGIN_FAILED', { lang });
      throw new CustomApiException(ErrorCode.AUTH_LOGIN_FAILED, message, HttpStatus.UNAUTHORIZED);
    }

    // 3. Extract dynamic roles and permissions from database relations
    const { roles, permissions } = this.extractUserPermissionsAndRoles(dbUser);

    // 4. If 2FA is active, require 2-step OTP verification before issuing final tokens
    if (dbUser.isTwoFactorEnabled) {
      const preAuthToken = await this.jwtService.signAsync(
        { sub: dbUser.id, email: dbUser.email, isPreAuth: true },
        { expiresIn: '5m' }
      );

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

    // 5. Save Multi-Device UserSession record in MySQL
    const tokenHash = await bcrypt.hash(tokens.refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

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

  async authenticate2FA(preAuthToken: string, otpCode: string, meta?: SessionMeta) {
    const lang = I18nContext.current()?.lang;

    let decoded: any;
    try {
      decoded = await this.jwtService.verifyAsync(preAuthToken);
    } catch {
      const message = this.i18n.t('auth.TWO_FACTOR_EXPIRED', { lang });
      throw new CustomApiException(ErrorCode.AUTH_2FA_EXPIRED, message, HttpStatus.UNAUTHORIZED);
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { email: decoded.email },
      include: this.userIncludeRelations,
    });

    if (!dbUser || !dbUser.isActive) {
      const message = this.i18n.t('auth.LOGIN_FAILED', { lang });
      throw new CustomApiException(ErrorCode.AUTH_LOGIN_FAILED, message, HttpStatus.UNAUTHORIZED);
    }

    if (!dbUser.twoFactorSecret) {
      const message = this.i18n.t('auth.TWO_FACTOR_INVALID', { lang });
      throw new CustomApiException(ErrorCode.AUTH_2FA_INVALID, message, HttpStatus.BAD_REQUEST);
    }

    const isValid = this.twoFactorService.verifyCode(dbUser.twoFactorSecret, otpCode);
    if (!isValid) {
      const message = this.i18n.t('auth.TWO_FACTOR_INVALID', { lang });
      throw new CustomApiException(ErrorCode.AUTH_2FA_INVALID, message, HttpStatus.BAD_REQUEST);
    }

    const { roles, permissions } = this.extractUserPermissionsAndRoles(dbUser);

    const payload = {
      sub: dbUser.id,
      email: dbUser.email,
      roles,
      permissions,
    };

    const tokens = await this.generateTokens(payload);

    // Save Multi-Device UserSession record in MySQL
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

  async generate2FASecret(email: string) {
    const secret = this.twoFactorService.generateSecret();
    const otpAuthUrl = this.twoFactorService.generateOtpauthUrl(email, secret);

    return {
      secret,
      otpAuthUrl,
    };
  }

  async turnOn2FA(email: string, otpCode: string) {
    const lang = I18nContext.current()?.lang;

    const dbUser = await this.prisma.user.findUnique({ where: { email } });
    if (!dbUser) {
      const message = this.i18n.t('auth.UNAUTHORIZED', { lang });
      throw new CustomApiException(ErrorCode.AUTH_UNAUTHORIZED, message, HttpStatus.UNAUTHORIZED);
    }

    const secret = dbUser.twoFactorSecret;
    if (!secret) {
      const message = this.i18n.t('auth.TWO_FACTOR_INVALID', { lang });
      throw new CustomApiException(ErrorCode.AUTH_2FA_INVALID, message, HttpStatus.BAD_REQUEST);
    }

    const isValid = this.twoFactorService.verifyCode(secret, otpCode);
    if (!isValid) {
      const message = this.i18n.t('auth.TWO_FACTOR_INVALID', { lang });
      throw new CustomApiException(ErrorCode.AUTH_2FA_INVALID, message, HttpStatus.BAD_REQUEST);
    }

    await this.prisma.user.update({
      where: { email },
      data: { isTwoFactorEnabled: true },
    });

    const message = this.i18n.t('auth.TWO_FACTOR_ACTIVATED', { lang });
    return { success: true, message };
  }

  async turnOff2FA(email: string) {
    const lang = I18nContext.current()?.lang;

    const dbUser = await this.prisma.user.findUnique({ where: { email } });
    if (!dbUser) {
      const message = this.i18n.t('auth.UNAUTHORIZED', { lang });
      throw new CustomApiException(ErrorCode.AUTH_UNAUTHORIZED, message, HttpStatus.UNAUTHORIZED);
    }

    await this.prisma.user.update({
      where: { email },
      data: { isTwoFactorEnabled: false, twoFactorSecret: null },
    });

    const message = this.i18n.t('auth.TWO_FACTOR_DEACTIVATED', { lang });
    return { success: true, message };
  }

  async refreshToken(user: any, meta?: SessionMeta) {
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
      const lang = I18nContext.current()?.lang;
      const message = this.i18n.t('auth.UNAUTHORIZED', { lang, defaultValue: 'Không có quyền truy cập' });
      throw new CustomApiException(ErrorCode.AUTH_UNAUTHORIZED, message, HttpStatus.UNAUTHORIZED);
    }

    // Verify incoming refreshToken against active MySQL UserSessions
    const incomingToken = meta?.refreshToken;
    let matchingSession: any = null;

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

    // Rotate token on active session if found, or create session
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
    } else {
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

  async logoutSession(userId: string, refreshToken?: string) {
    if (!userId) return;

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

  private async generateTokens(payload: any) {
    const jwtSecret = this.configService.get<string>('auth.jwtSecret');
    const jwtExpiresIn = this.configService.get<string>('auth.jwtExpiresIn') || '1h';
    const jwtRefreshSecret = this.configService.get<string>('auth.jwtRefreshSecret');
    const jwtRefreshExpiresIn = this.configService.get<string>('auth.jwtRefreshExpiresIn') || '7d';

    if (!jwtSecret || !jwtRefreshSecret) {
      throw new CustomApiException(
        ErrorCode.SYS_CONFIG_ERROR,
        'Cấu hình JWT Secret chưa được khai báo trong hệ thống',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtSecret,
        expiresIn: jwtExpiresIn as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: jwtRefreshSecret,
        expiresIn: jwtRefreshExpiresIn as any,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: jwtExpiresIn,
    };
  }
}
