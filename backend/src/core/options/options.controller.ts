import { Controller, Get, Post, Delete, Body, UseGuards, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OptionsService } from './options.service';
import { MailConfigService } from '../mail/mail-config.service';
import { GmailOAuthService } from '../mail/gmail-oauth.service';
import { MailConfigDto, MailTestDto, GmailExchangeDto } from '../mail/dto/mail-config.dto';
import { StorageConfigService } from '../storage/storage-config.service';
import { StorageConfigDto } from '../storage/dto/storage-config.dto';
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
    private readonly storageConfigService: StorageConfigService,
  ) {}

  @Public()
  @Get('public')
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate')
  @ApiOperation({
    summary: 'Lấy thông tin cấu hình công khai (Tiêu đề trang, logo, ngôn ngữ...)',
  })
  async getPublicOptions() {
    const data = await this.optionsService.getPublicOptions();
    return {
      success: true,
      data,
    };
  }

  @ApiBearerAuth()
  @RequirePermissions('setting:read')
  @Get()
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate')
  @ApiOperation({
    summary: 'Lấy toàn bộ cấu hình hệ thống (Dành cho Quản trị viên)',
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

  @ApiBearerAuth()
  @RequirePermissions('setting:read')
  @Get('storage-config')
  @ApiOperation({ summary: 'Lấy cấu hình lưu trữ media hiện tại (secret đã được ẩn)' })
  async getStorageConfig() {
    return { success: true, data: await this.storageConfigService.getMaskedConfig() };
  }

  @ApiBearerAuth()
  @RequirePermissions('setting:update')
  @Post('storage-config')
  @ApiOperation({ summary: 'Lưu cấu hình lưu trữ media (Local/S3/MinIO)' })
  async saveStorageConfig(@Body() dto: StorageConfigDto) {
    return {
      success: true,
      message: 'Đã lưu cấu hình lưu trữ media thành công!',
      data: await this.storageConfigService.saveConfig(dto),
    };
  }

  @ApiBearerAuth()
  @RequirePermissions('setting:update')
  @Post('storage-config/test')
  @ApiOperation({ summary: 'Kiểm tra kết nối S3/MinIO bằng cấu hình đang lưu' })
  async testStorageConfig() {
    await this.storageConfigService.testConnection();
    return { success: true, message: 'Kết nối S3/MinIO thành công!' };
  }
}
