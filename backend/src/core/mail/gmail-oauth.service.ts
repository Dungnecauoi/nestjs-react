import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send';

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  id_token?: string;
  scope: string;
  token_type: string;
}

@Injectable()
export class GmailOAuthService {
  constructor(private readonly configService: ConfigService) {}

  private get clientId(): string {
    return this.configService.get<string>('mail.googleOauth.clientId') || '';
  }

  private get clientSecret(): string {
    return this.configService.get<string>('mail.googleOauth.clientSecret') || '';
  }

  private get redirectUri(): string {
    return this.configService.get<string>('mail.googleOauth.redirectUri') || '';
  }

  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret && this.redirectUri);
  }

  getAuthUrl(): string {
    if (!this.isConfigured()) {
      throw new BadRequestException(
        'Chưa cấu hình GOOGLE_OAUTH_CLIENT_ID/SECRET/REDIRECT_URI trong .env — cần tạo OAuth Client trên Google Cloud Console trước.',
      );
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: GMAIL_SEND_SCOPE,
      access_type: 'offline',
      prompt: 'consent',
    });

    return `${GOOGLE_AUTH_URL}?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<{ email: string; refreshToken: string }> {
    const { data } = await axios.post<GoogleTokenResponse>(GOOGLE_TOKEN_URL, {
      code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      grant_type: 'authorization_code',
    });

    if (!data.refresh_token) {
      throw new BadRequestException(
        'Google không trả refresh_token — thu hồi quyền ứng dụng trong tài khoản Google rồi kết nối lại (prompt=consent chỉ trả refresh_token lần đồng ý đầu tiên).',
      );
    }

    const email = await this.getConnectedEmail(data.access_token);

    return { email, refreshToken: data.refresh_token };
  }

  async getAccessToken(refreshToken: string): Promise<string> {
    const { data } = await axios.post<GoogleTokenResponse>(GOOGLE_TOKEN_URL, {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    return data.access_token;
  }

  private async getConnectedEmail(accessToken: string): Promise<string> {
    const { data } = await axios.get<{ email: string }>(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    return data.email;
  }
}
