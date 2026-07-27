import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService, parseDurationToMs } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BypassMaintenance } from '../../common/decorators/bypass-maintenance.decorator';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth Module')
@BypassMaintenance() // Đăng nhập/2FA/refresh phải hoạt động được trong lúc bảo trì để admin tắt được chế độ bảo trì
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private getCookieName(): string {
    return (
      this.configService.get<string>('auth.cookieName') || 'ecomcx_session'
    );
  }

  private getCookieMaxAge(): number {
    const expiresIn =
      this.configService.get<string>('auth.jwtRefreshExpiresIn') || '7d';
    return parseDurationToMs(expiresIn);
  }

  private getCookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/api/auth',
      maxAge: this.getCookieMaxAge(),
    };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @ApiOperation({
    summary: 'Đăng nhập hệ thống (Cấp Access Token hoặc Chặn 2FA OTP)',
  })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const meta = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    };

    const result = await this.authService.login(dto, meta);

    // If 2FA is not required and refreshToken exists, set HttpOnly Cookie scoped to /api/auth
    if (
      result &&
      !result.isTwoFactorRequired &&
      'refreshToken' in result &&
      result.refreshToken
    ) {
      res.cookie(
        this.getCookieName(),
        result.refreshToken,
        this.getCookieOptions(),
      );
    }

    return result;
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('2fa/authenticate')
  @ApiOperation({ summary: 'Xác nhận mã 6 số 2FA OTP khi Đăng Nhập' })
  async authenticate2FA(
    @Body() body: { preAuthToken: string; otpCode: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const meta = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    };

    const result = await this.authService.authenticate2FA(
      body.preAuthToken,
      body.otpCode,
      meta,
    );

    if (result && result.refreshToken) {
      res.cookie(
        this.getCookieName(),
        result.refreshToken,
        this.getCookieOptions(),
      );
    }

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('2fa/generate')
  @ApiOperation({
    summary: 'Tạo Secret & QR Code TOTP cho tài khoản đang đăng nhập',
  })
  async generate2FASecret(@CurrentUser() user: any) {
    return this.authService.generate2FASecret(user.id ?? user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('2fa/turn-on')
  @ApiOperation({
    summary: 'Xác minh OTP và Kích Hoạt 2FA cho tài khoản đang đăng nhập',
  })
  async turnOn2FA(@CurrentUser() user: any, @Body() body: { otpCode: string }) {
    return this.authService.turnOn2FA(user.id ?? user.sub, body.otpCode);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('2fa/turn-off')
  @ApiOperation({
    summary: 'Tắt 2FA cho tài khoản đang đăng nhập (yêu cầu OTP hiện tại)',
  })
  async turnOff2FA(
    @CurrentUser() user: any,
    @Body() body: { otpCode: string },
  ) {
    return this.authService.turnOff2FA(user.id ?? user.sub, body.otpCode);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy Access Token mới bằng Refresh Cookie' })
  async refreshToken(
    @CurrentUser() user: any,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.[this.getCookieName()];
    const meta = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      refreshToken,
    };

    const tokens = await this.authService.refreshToken(user, meta);

    if (tokens && tokens.refreshToken) {
      res.cookie(
        this.getCookieName(),
        tokens.refreshToken,
        this.getCookieOptions(),
      );
    }

    return tokens;
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('forgot-password')
  @ApiOperation({ summary: 'Gửi email hướng dẫn đặt lại mật khẩu' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('reset-password')
  @ApiOperation({ summary: 'Đặt lại mật khẩu bằng token nhận được qua email' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('change-password')
  @ApiOperation({ summary: 'Thay đổi mật khẩu tài khoản đang đăng nhập' })
  async changePassword(
    @CurrentUser() user: any,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(user.id ?? user.sub, body);
  }

  @Public()
  @Post('verify-email')
  @ApiOperation({
    summary: 'Xác minh địa chỉ email bằng token nhận được qua email',
  })
  async verifyEmail(@Body() body: { token: string }) {
    return this.authService.verifyEmail(body.token);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('resend-verification')
  @ApiOperation({
    summary: 'Gửi lại email xác minh cho tài khoản đang đăng nhập',
  })
  async resendVerification(@CurrentUser() user: any) {
    return this.authService.resendVerificationEmail(user.id ?? user.sub);
  }

  @Public()
  @Post('logout')
  @ApiOperation({
    summary: 'Đăng xuất hệ thống và xóa HttpOnly Refresh Cookie',
  })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
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

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tự cập nhật hồ sơ cá nhân (tên, avatar, SĐT, ngày sinh...)' })
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(user.id ?? user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Liệt kê các phiên đăng nhập (thiết bị) đang hoạt động của tài khoản hiện tại' })
  async listSessions(@CurrentUser() user: any, @Req() req: Request) {
    const currentRefreshToken = req.cookies?.[this.getCookieName()];
    return this.authService.listSessions(user.id ?? user.sub, currentRefreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thu hồi 1 phiên đăng nhập của chính tài khoản hiện tại' })
  async revokeSession(@CurrentUser() user: any, @Param('id') id: string) {
    return this.authService.revokeSessionById(user.id ?? user.sub, id);
  }
}
