import { Controller, Get, Post, Delete, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OptionsService } from './options.service';
import { MailConfigService } from '../mail/mail-config.service';
import { GmailOAuthService } from '../mail/gmail-oauth.service';
import { MailConfigDto, MailTestDto, GmailExchangeDto } from '../mail/dto/mail-config.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Options & System Settings Module')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('options')
export class OptionsController {
  constructor(
    private readonly optionsService: OptionsService,
    private readonly mailConfigService: MailConfigService,
    private readonly gmailOAuthService: GmailOAuthService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Lấy toàn bộ cấu hình hệ thống (wp_options architecture)',
  })
  async getAllOptions() {
    const data = await this.optionsService.getAllOptions();
    return {
      success: true,
      data,
    };
  }

  @ApiBearerAuth()
  @RequirePermissions('setting:update')
  @Post()
  @ApiOperation({
    summary: 'Lưu hoặc cập nhật hàng loạt cấu hình hệ thống vào Database',
  })
  async setOptions(@Body() options: Record<string, any>) {
    const updated = await this.optionsService.setMultipleOptions(options);
    return {
      success: true,
      message: 'Đã lưu cấu hình hệ thống vào Database thành công!',
      data: updated,
    };
  }

  @ApiBearerAuth()
  @RequirePermissions('setting:read')
  @Get('mail-config')
  @ApiOperation({ summary: 'Lấy cấu hình gửi mail hiện tại (secret đã được ẩn)' })
  async getMailConfig() {
    return { success: true, data: await this.mailConfigService.getMaskedConfig() };
  }

  @ApiBearerAuth()
  @RequirePermissions('setting:update')
  @Post('mail-config')
  @ApiOperation({ summary: 'Lưu cấu hình gửi mail (SMTP/Resend/SES/Mailgun/SendGrid)' })
  async saveMailConfig(@Body() dto: MailConfigDto) {
    return {
      success: true,
      message: 'Đã lưu cấu hình gửi mail thành công!',
      data: await this.mailConfigService.saveConfig(dto),
    };
  }

  @ApiBearerAuth()
  @RequirePermissions('setting:update')
  @Post('mail-config/test')
  @ApiOperation({ summary: 'Gửi email thử nghiệm bằng driver đang cấu hình' })
  async testMailConfig(@Body() dto: MailTestDto) {
    await this.mailConfigService.sendTestEmail(dto.testEmail);
    return { success: true, message: `Đã gửi email thử nghiệm tới ${dto.testEmail}` };
  }

  @ApiBearerAuth()
  @RequirePermissions('setting:update')
  @Get('mail-config/gmail-oauth/connect-url')
  @ApiOperation({ summary: 'Lấy URL đăng nhập Google để kết nối Gmail OAuth2' })
  async getGmailOAuthConnectUrl() {
    return { success: true, data: { url: this.gmailOAuthService.getAuthUrl() } };
  }

  @ApiBearerAuth()
  @RequirePermissions('setting:update')
  @Post('mail-config/gmail-oauth/exchange')
  @ApiOperation({ summary: 'Đổi authorization code Google lấy refresh token và lưu cấu hình' })
  async exchangeGmailOAuthCode(@Body() dto: GmailExchangeDto) {
    const { email, refreshToken } = await this.gmailOAuthService.exchangeCode(dto.code);
    return {
      success: true,
      message: `Đã kết nối Gmail: ${email}`,
      data: await this.mailConfigService.saveGmailOAuth(email, refreshToken),
    };
  }

  @ApiBearerAuth()
  @RequirePermissions('setting:update')
  @Delete('mail-config/gmail-oauth')
  @ApiOperation({ summary: 'Ngắt kết nối Gmail OAuth2' })
  async disconnectGmailOAuth() {
    return { success: true, data: await this.mailConfigService.disconnectGmail() };
  }
}
