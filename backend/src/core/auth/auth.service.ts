import { Injectable, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { I18nContext, I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../database/prisma.service';
import { TwoFactorService } from './two-factor.service';
import { MailService } from '../mail/mail.service';
import { CustomApiException } from '../../common/exceptions/custom-api.exception';
import { ErrorCode } from '../../common/enums/error-code.enum';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MediaService } from '../../modules/media/media.service';

type UserTokenType = 'PASSWORD_RESET' | 'EMAIL_VERIFY';

interface SessionMeta {
  userAgent?: string;
  ipAddress?: string;
  refreshToken?: string;
}

/**
 * Parse chuỗi thời hạn kiểu '7d' | '12h' | '30m' | '45s' sang mili-giây.
 * Dùng chung cho cookie maxAge (AuthController) và UserSession.expiresAt (AuthService).
 */
export function parseDurationToMs(
  value: string,
  fallbackMs = 7 * 24 * 60 * 60 * 1000,
): number {
  const match = /^(\d+)(d|h|m|s)$/.exec(value?.trim() || '');
  if (!match) {
    return fallbackMs;
  }
  const amount = parseInt(match[1], 10);
  const unitMs: Record<string, number> = {
    d: 24 * 60 * 60 * 1000,
    h: 60 * 60 * 1000,
    m: 60 * 1000,
    s: 1000,
  };
  return amount * unitMs[match[2]];
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
    private readonly twoFactorService: TwoFactorService,
    private readonly mailService: MailService,
    private readonly mediaService: MediaService,
  ) {}

  private extractUserPermissionsAndRoles(dbUser: any) {
    const roles = dbUser.roles ? dbUser.roles.map((r: any) => r.role.code) : [];
    const rolePermissions = dbUser.roles
      ? dbUser.roles.flatMap((r: any) =>
          r.role.permissions.map((p: any) => p.permission.code),
        )
      : [];
    const directPermissions = dbUser.permissions
      ? dbUser.permissions.map((p: any) => p.permission.code)
      : [];

    const permissions = Array.from(
      new Set([...rolePermissions, ...directPermissions]),
    );
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
      throw new CustomApiException(
        ErrorCode.AUTH_LOGIN_FAILED,
        message,
        HttpStatus.UNAUTHORIZED,
      );
    }

    // 1.1 Check if Account is temporarily locked
    if (dbUser.lockedUntil) {
      if (dbUser.lockedUntil > new Date()) {
        const message = this.i18n.t('user.ACCOUNT_LOCKED', {
          lang,
          defaultValue: 'Tài khoản tạm thời bị khóa do nhập sai mật khẩu quá 5 lần. Vui lòng thử lại sau 15 phút.',
        });
        throw new CustomApiException(
          ErrorCode.AUTH_FORBIDDEN,
          message,
          HttpStatus.FORBIDDEN,
        );
      } else {
        // Unlock expired lock
        await this.prisma.user.update({
          where: { id: dbUser.id },
          data: { failedLoginAttempts: 0, lockedUntil: null },
        });
      }
    }

    // 2. Verify Bcrypt Hashed Password
    const isPasswordValid = await bcrypt.compare(dto.password, dbUser.password);
    if (!isPasswordValid) {
      const newAttempts = (dbUser.failedLoginAttempts || 0) + 1;
      const isLocking = newAttempts >= 5;
      const lockedUntil = isLocking ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await this.prisma.user.update({
        where: { id: dbUser.id },
        data: {
          failedLoginAttempts: isLocking ? 0 : newAttempts,
          lockedUntil: isLocking ? lockedUntil : dbUser.lockedUntil,
        },
      });

      if (isLocking) {
        const message = this.i18n.t('user.ACCOUNT_LOCKED', {
          lang,
          defaultValue: 'Tài khoản tạm thời bị khóa do nhập sai mật khẩu quá 5 lần. Vui lòng thử lại sau 15 phút.',
        });
        throw new CustomApiException(
          ErrorCode.AUTH_FORBIDDEN,
          message,
          HttpStatus.FORBIDDEN,
        );
      }

      const message = this.i18n.t('auth.LOGIN_FAILED', { lang });
      throw new CustomApiException(
        ErrorCode.AUTH_LOGIN_FAILED,
        message,
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Reset failed login attempts on successful password verification
    if (dbUser.failedLoginAttempts > 0 || dbUser.lockedUntil) {
      await this.prisma.user.update({
        where: { id: dbUser.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    }

    // 3. Extract dynamic roles and permissions from database relations
    const { roles, permissions } = this.extractUserPermissionsAndRoles(dbUser);

    // 4. If 2FA is active, require 2-step OTP verification before issuing final tokens
    if (dbUser.isTwoFactorEnabled) {
      const preAuthToken = await this.jwtService.signAsync(
        { sub: dbUser.id, email: dbUser.email, isPreAuth: true },
        { expiresIn: '5m' },
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
    const tokenHash = await bcrypt.hash(
      tokens.refreshToken,
      this.configService.get<number>('auth.bcryptRounds') || 12,
    );
    const expiresAt = new Date(Date.now() + this.getSessionDurationMs());

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
        avatar: dbUser.avatar,
        phone: dbUser.phone,
        roles,
        permissions,
        isTwoFactorEnabled: dbUser.isTwoFactorEnabled,
      },
      ...tokens,
    };
  }

  async authenticate2FA(
    preAuthToken: string,
    otpCode: string,
    meta?: SessionMeta,
  ) {
    const lang = I18nContext.current()?.lang;

    let decoded: any;
    try {
      decoded = await this.jwtService.verifyAsync(preAuthToken);
    } catch {
      const message = this.i18n.t('auth.TWO_FACTOR_EXPIRED', { lang });
      throw new CustomApiException(
        ErrorCode.AUTH_2FA_EXPIRED,
        message,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { email: decoded.email },
      include: this.userIncludeRelations,
    });

    if (!dbUser || !dbUser.isActive) {
      const message = this.i18n.t('auth.LOGIN_FAILED', { lang });
      throw new CustomApiException(
        ErrorCode.AUTH_LOGIN_FAILED,
        message,
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!dbUser.twoFactorSecret) {
      const message = this.i18n.t('auth.TWO_FACTOR_INVALID', { lang });
      throw new CustomApiException(
        ErrorCode.AUTH_2FA_INVALID,
        message,
        HttpStatus.BAD_REQUEST,
      );
    }

    const isValid = this.twoFactorService.verifyCode(
      dbUser.twoFactorSecret,
      otpCode,
    );
    if (!isValid) {
      const message = this.i18n.t('auth.TWO_FACTOR_INVALID', { lang });
      throw new CustomApiException(
        ErrorCode.AUTH_2FA_INVALID,
        message,
        HttpStatus.BAD_REQUEST,
      );
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
    const tokenHash = await bcrypt.hash(
      tokens.refreshToken,
      this.configService.get<number>('auth.bcryptRounds') || 12,
    );
    const expiresAt = new Date(Date.now() + this.getSessionDurationMs());

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
        avatar: dbUser.avatar,
        phone: dbUser.phone,
        roles,
        permissions,
        isTwoFactorEnabled: dbUser.isTwoFactorEnabled,
      },
      ...tokens,
    };
  }

  async generate2FASecret(userId: string) {
    const lang = I18nContext.current()?.lang;

    const dbUser = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser) {
      const message = this.i18n.t('auth.UNAUTHORIZED', { lang });
      throw new CustomApiException(
        ErrorCode.AUTH_UNAUTHORIZED,
        message,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const secret = this.twoFactorService.generateSecret();
    const otpAuthUrl = this.twoFactorService.generateOtpauthUrl(
      dbUser.email,
      secret,
    );

    // Lưu secret tạm thời (chưa bật isTwoFactorEnabled) để turnOn2FA có thể verify OTP đầu tiên
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });

    return {
      secret,
      otpAuthUrl,
    };
  }

  async turnOn2FA(userId: string, otpCode: string) {
    const lang = I18nContext.current()?.lang;

    const dbUser = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser) {
      const message = this.i18n.t('auth.UNAUTHORIZED', { lang });
      throw new CustomApiException(
        ErrorCode.AUTH_UNAUTHORIZED,
        message,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const secret = dbUser.twoFactorSecret;
    if (!secret) {
      const message = this.i18n.t('auth.TWO_FACTOR_INVALID', { lang });
      throw new CustomApiException(
        ErrorCode.AUTH_2FA_INVALID,
        message,
        HttpStatus.BAD_REQUEST,
      );
    }

    const isValid = this.twoFactorService.verifyCode(secret, otpCode);
    if (!isValid) {
      const message = this.i18n.t('auth.TWO_FACTOR_INVALID', { lang });
      throw new CustomApiException(
        ErrorCode.AUTH_2FA_INVALID,
        message,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled: true },
    });

    const message = this.i18n.t('auth.TWO_FACTOR_ACTIVATED', { lang });
    return { success: true, message };
  }

  async turnOff2FA(userId: string, otpCode: string) {
    const lang = I18nContext.current()?.lang;

    const dbUser = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser) {
      const message = this.i18n.t('auth.UNAUTHORIZED', { lang });
      throw new CustomApiException(
        ErrorCode.AUTH_UNAUTHORIZED,
        message,
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (dbUser.isTwoFactorEnabled) {
      if (
        !dbUser.twoFactorSecret ||
        !this.twoFactorService.verifyCode(dbUser.twoFactorSecret, otpCode)
      ) {
        const message = this.i18n.t('auth.TWO_FACTOR_INVALID', { lang });
        throw new CustomApiException(
          ErrorCode.AUTH_2FA_INVALID,
          message,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
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
      const message = this.i18n.t('auth.UNAUTHORIZED', {
        lang,
        defaultValue: 'Không có quyền truy cập',
      });
      throw new CustomApiException(
        ErrorCode.AUTH_UNAUTHORIZED,
        message,
        HttpStatus.UNAUTHORIZED,
      );
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

      // A6: refresh token không khớp bất kỳ session còn hiệu lực nào (đã bị revoke, đã dùng để
      // rotate trước đó — dấu hiệu replay, hoặc phiên đã bị thu hồi thủ công) -> từ chối thẳng,
      // không tạo session mới ngầm cho 1 token đáng ngờ.
      if (!matchingSession) {
        const lang = I18nContext.current()?.lang;
        const message = this.i18n.t('auth.UNAUTHORIZED', {
          lang,
          defaultValue: 'Phiên đăng nhập không hợp lệ hoặc đã bị thu hồi',
        });
        throw new CustomApiException(
          ErrorCode.AUTH_UNAUTHORIZED,
          message,
          HttpStatus.UNAUTHORIZED,
        );
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
    const newTokenHash = await bcrypt.hash(
      tokens.refreshToken,
      this.configService.get<number>('auth.bcryptRounds') || 12,
    );
    const newExpiresAt = new Date(Date.now() + this.getSessionDurationMs());

    if (matchingSession) {
      await this.prisma.userSession.update({
        where: { id: matchingSession.id },
        data: {
          tokenHash: newTokenHash,
          expiresAt: newExpiresAt,
          updatedAt: new Date(),
        },
      });
    } else if (incomingToken) {
      // A6: Refresh token có nhưng không match session nào — có thể cookie bị rò rỉ.
      // Từ chối cấp token mới (KHÔNG tạo session mới) để ngăn session hijacking.
      const lang = I18nContext.current()?.lang;
      const message = this.i18n.t('auth.UNAUTHORIZED', {
        lang,
        defaultValue: 'Phiên đăng nhập không hợp lệ hoặc đã bị thu hồi. Vui lòng đăng nhập lại.',
      });
      throw new CustomApiException(
        ErrorCode.AUTH_UNAUTHORIZED,
        message,
        HttpStatus.UNAUTHORIZED,
      );
    } else {
      // Không có refresh token trong cookie (first-time hoặc đã clear) — tạo session mới bình thường
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
        avatar: dbUser.avatar,
        phone: dbUser.phone,
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

  /**
   * Liệt kê các phiên đăng nhập (thiết bị) đang hoạt động của chính user hiện tại.
   * Không trả tokenHash. Đánh dấu isCurrent nếu khớp refreshToken đang dùng.
   */
  async listSessions(userId: string, currentRefreshToken?: string) {
    const sessions = await this.prisma.userSession.findMany({
      where: { userId, isRevoked: false, expiresAt: { gt: new Date() } },
      orderBy: { updatedAt: 'desc' },
    });

    const result: Array<{
      id: string;
      userAgent: string | null;
      ipAddress: string | null;
      createdAt: Date;
      updatedAt: Date;
      isCurrent: boolean;
    }> = [];
    for (const session of sessions) {
      let isCurrent = false;
      if (currentRefreshToken) {
        isCurrent = await bcrypt.compare(currentRefreshToken, session.tokenHash);
      }
      result.push({
        id: session.id,
        userAgent: session.userAgent,
        ipAddress: session.ipAddress,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        isCurrent,
      });
    }
    return result;
  }

  /**
   * Thu hồi 1 phiên đăng nhập, chỉ cho phép thu hồi phiên thuộc về chính user hiện tại.
   */
  async revokeSessionById(userId: string, sessionId: string) {
    const lang = I18nContext.current()?.lang;
    const session = await this.prisma.userSession.findUnique({ where: { id: sessionId } });

    if (!session || session.userId !== userId) {
      const message = this.i18n.t('auth.UNAUTHORIZED', { lang });
      throw new CustomApiException(ErrorCode.AUTH_UNAUTHORIZED, message, HttpStatus.FORBIDDEN);
    }

    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: { isRevoked: true },
    });

    return { success: true };
  }

  private async generateTokens(payload: any) {
    const jwtSecret = this.configService.get<string>('auth.jwtSecret');
    const jwtExpiresIn =
      this.configService.get<string>('auth.jwtExpiresIn') || '1h';
    const jwtRefreshSecret = this.configService.get<string>(
      'auth.jwtRefreshSecret',
    );
    const jwtRefreshExpiresIn =
      this.configService.get<string>('auth.jwtRefreshExpiresIn') || '7d';

    if (!jwtSecret || !jwtRefreshSecret) {
      throw new CustomApiException(
        ErrorCode.SYS_CONFIG_ERROR,
        'Cấu hình JWT Secret chưa được khai báo trong hệ thống',
        HttpStatus.INTERNAL_SERVER_ERROR,
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

  private hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  /**
   * Sinh token ngẫu nhiên dùng 1 lần (quên mật khẩu / xác minh email), lưu bản băm SHA-256
   * (không dùng bcrypt vì cần tra cứu trực tiếp theo hash, token đã đủ entropy ngẫu nhiên).
   */
  private async issueUserToken(
    userId: string,
    type: UserTokenType,
    ttlMinutes: number,
  ): Promise<string> {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    await this.prisma.userToken.create({
      data: { userId, type, tokenHash, expiresAt },
    });

    return rawToken;
  }

  private async consumeUserToken(
    rawToken: string,
    type: UserTokenType,
  ): Promise<string | null> {
    const tokenHash = this.hashToken(rawToken);
    const record = await this.prisma.userToken.findFirst({
      where: { tokenHash, type, usedAt: null, expiresAt: { gt: new Date() } },
    });

    if (!record) {
      return null;
    }

    await this.prisma.userToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    return record.userId;
  }

  async forgotPassword(email: string) {
    const lang = I18nContext.current()?.lang;
    const dbUser = await this.prisma.user.findUnique({ where: { email } });

    if (dbUser && dbUser.isActive && !dbUser.deletedAt) {
      const rawToken = await this.issueUserToken(
        dbUser.id,
        'PASSWORD_RESET',
        30,
      );
      const appUrl =
        this.configService.get<string>('app.url') || 'http://localhost:3000';
      const resetLink = `${appUrl}/reset-password?token=${rawToken}`;

      await this.mailService.send(
        dbUser.email,
        'Đặt lại mật khẩu',
        `<p>Nhấn vào liên kết sau để đặt lại mật khẩu (hiệu lực 30 phút):</p><p><a href="${resetLink}">${resetLink}</a></p>`,
      );
    }

    // Luôn trả message chung chung, không tiết lộ email có tồn tại trong hệ thống hay không
    return {
      success: true,
      message: this.i18n.t('auth.PASSWORD_RESET_EMAIL_SENT', {
        lang,
        defaultValue:
          'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.',
      }),
    };
  }

  async resetPassword(rawToken: string, newPassword: string) {
    const lang = I18nContext.current()?.lang;
    const userId = await this.consumeUserToken(rawToken, 'PASSWORD_RESET');

    if (!userId) {
      const message = this.i18n.t('auth.TOKEN_INVALID', {
        lang,
        defaultValue: 'Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn',
      });
      throw new CustomApiException(
        ErrorCode.AUTH_TOKEN_INVALID,
        message,
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      this.configService.get<number>('auth.bcryptRounds') || 12,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Đổi mật khẩu bắt buộc đăng xuất mọi thiết bị (refresh token cũ không còn hiệu lực)
    await this.prisma.userSession.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });

    const message = this.i18n.t('auth.PASSWORD_RESET_SUCCESS', {
      lang,
      defaultValue: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.',
    });
    return { success: true, message };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const lang = I18nContext.current()?.lang;
    const dbUser = await this.prisma.user.findUnique({ where: { id: userId, deletedAt: null } });

    if (!dbUser) {
      const message = this.i18n.t('auth.UNAUTHORIZED', { lang });
      throw new CustomApiException(ErrorCode.AUTH_UNAUTHORIZED, message, HttpStatus.UNAUTHORIZED);
    }

    let avatarUrl: string | undefined;
    if (dto.avatarMediaId !== undefined) {
      const media = await this.mediaService.findOne(dto.avatarMediaId);
      avatarUrl = media.url;
      // Gỡ avatar hiện tại (nếu có) khỏi collection 'avatar' của user này — media cũ vẫn còn
      // nguyên, chỉ không còn là avatar hiện hành, vẫn dùng lại được ở nơi khác.
      await this.mediaService.detach('User', userId, 'avatar');
      await this.mediaService.attachTo(media.id, 'User', userId, 'avatar');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(avatarUrl !== undefined && { avatar: avatarUrl }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.identityCard !== undefined && { identityCard: dto.identityCard }),
        ...(dto.gender !== undefined && { gender: dto.gender }),
        ...(dto.dateOfBirth !== undefined && { dateOfBirth: new Date(dto.dateOfBirth) }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      avatar: updated.avatar,
      phone: updated.phone,
      identityCard: updated.identityCard,
      gender: updated.gender,
      dateOfBirth: updated.dateOfBirth,
      address: updated.address,
      bio: updated.bio,
    };
  }

  async changePassword(userId: string, dto: { currentPassword: string; newPassword: string }) {
    const lang = I18nContext.current()?.lang;
    const dbUser = await this.prisma.user.findUnique({ where: { id: userId, deletedAt: null } });

    if (!dbUser) {
      const message = this.i18n.t('auth.UNAUTHORIZED', { lang });
      throw new CustomApiException(ErrorCode.AUTH_UNAUTHORIZED, message, HttpStatus.UNAUTHORIZED);
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, dbUser.password);
    if (!isMatch) {
      const message = this.i18n.t('auth.CURRENT_PASSWORD_INCORRECT', {
        lang,
        defaultValue: 'Mật khẩu hiện tại không chính xác!',
      });
      throw new CustomApiException(ErrorCode.AUTH_LOGIN_FAILED, message, HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(
      dto.newPassword,
      this.configService.get<number>('auth.bcryptRounds') || 12,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await this.prisma.userSession.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });

    const message = this.i18n.t('auth.PASSWORD_RESET_SUCCESS', {
      lang,
      defaultValue: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.',
    });
    return { success: true, message };
  }

  async verifyEmail(rawToken: string) {
    const lang = I18nContext.current()?.lang;
    const userId = await this.consumeUserToken(rawToken, 'EMAIL_VERIFY');

    if (!userId) {
      const message = this.i18n.t('auth.TOKEN_INVALID', { lang });
      throw new CustomApiException(
        ErrorCode.AUTH_TOKEN_INVALID,
        message,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerifiedAt: new Date() },
    });

    const message = this.i18n.t('auth.EMAIL_VERIFY_SUCCESS', { lang });
    return { success: true, message };
  }

  async resendVerificationEmail(userId: string) {
    const lang = I18nContext.current()?.lang;
    const dbUser = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!dbUser) {
      const message = this.i18n.t('auth.UNAUTHORIZED', { lang });
      throw new CustomApiException(
        ErrorCode.AUTH_UNAUTHORIZED,
        message,
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (dbUser.emailVerifiedAt) {
      const message = this.i18n.t('auth.EMAIL_ALREADY_VERIFIED', { lang });
      return { success: true, message };
    }

    const rawToken = await this.issueUserToken(dbUser.id, 'EMAIL_VERIFY', 60);
    const appUrl =
      this.configService.get<string>('app.url') || 'http://localhost:3000';
    const verifyLink = `${appUrl}/verify-email?token=${rawToken}`;

    await this.mailService.send(
      dbUser.email,
      'Xác minh địa chỉ email',
      `<p>Nhấn vào liên kết sau để xác minh email (hiệu lực 60 phút):</p><p><a href="${verifyLink}">${verifyLink}</a></p>`,
    );

    const message = this.i18n.t('auth.VERIFICATION_EMAIL_SENT', { lang });
    return { success: true, message };
  }

  private getSessionDurationMs(): number {
    const jwtRefreshExpiresIn =
      this.configService.get<string>('auth.jwtRefreshExpiresIn') || '7d';
    return parseDurationToMs(jwtRefreshExpiresIn);
  }

  /**
   * Dọn UserSession rác mỗi ngày: đã hết hạn, hoặc đã bị revoke quá 30 ngày.
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupExpiredSessions() {
    const revokedCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await this.prisma.userSession.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isRevoked: true, updatedAt: { lt: revokedCutoff } },
        ],
      },
    });
  }
}
