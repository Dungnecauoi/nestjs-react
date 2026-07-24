import { Controller, Post, Get, Body, UseGuards, Res, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth Module')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  private getCookieName(): string {
    return this.configService.get<string>('auth.cookieName') || 'ecomcx_session';
  }

  private getCookieMaxAge(): number {
    const expiresIn = this.configService.get<string>('auth.jwtRefreshExpiresIn') || '7d';
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

  private getCookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/api/auth',
      maxAge: this.getCookieMaxAge(),
    };
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập hệ thống (Cấp Access Token hoặc Chặn 2FA OTP)' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const meta = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    };

    const result = await this.authService.login(dto, meta);

    // If 2FA is not required and refreshToken exists, set HttpOnly Cookie scoped to /api/auth
    if (result && !result.isTwoFactorRequired && 'refreshToken' in result && result.refreshToken) {
      res.cookie(this.getCookieName(), result.refreshToken as string, this.getCookieOptions());
    }

    return result;
  }

  @Public()
  @Post('2fa/authenticate')
  @ApiOperation({ summary: 'Xác nhận mã 6 số 2FA OTP khi Đăng Nhập' })
  async authenticate2FA(
    @Body() body: { preAuthToken: string; otpCode: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
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

  @Public()
  @Post('2fa/generate')
  @ApiOperation({ summary: 'Tạo Secret & QR Code TOTP cho Google Authenticator' })
  async generate2FASecret(@Body() body: { email: string }) {
    return this.authService.generate2FASecret(body.email || 'admin@ecomcx.com');
  }

  @Public()
  @Post('2fa/turn-on')
  @ApiOperation({ summary: 'Xác minh OTP và Kích Hoạt 2FA trong Database' })
  async turnOn2FA(@Body() body: { email: string; otpCode: string }) {
    return this.authService.turnOn2FA(body.email || 'admin@ecomcx.com', body.otpCode);
  }

  @Public()
  @Post('2fa/turn-off')
  @ApiOperation({ summary: 'Tắt 2FA trong Database' })
  async turnOff2FA(@Body() body: { email: string }) {
    return this.authService.turnOff2FA(body.email || 'admin@ecomcx.com');
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy Access Token mới bằng Refresh Cookie' })
  async refreshToken(
    @CurrentUser() user: any,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
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

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Đăng xuất hệ thống và xóa HttpOnly Refresh Cookie' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies?.[this.getCookieName()];
    const userId = (req as any).user?.id || (req as any).user?.sub;

    if (userId) {
      await this.authService.logoutSession(userId, refreshToken);
    }

    res.clearCookie(this.getCookieName(), { path: '/api/auth' });
    return { success: true, message: 'Đã đăng xuất thành công' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin tài khoản đang đăng nhập' })
  getProfile(@CurrentUser() user: any) {
    return {
      message: 'Lấy thông tin tài khoản thành công',
      data: user,
    };
  }
}
