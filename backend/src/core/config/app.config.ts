import { registerAs } from '@nestjs/config';
import { printMissingEnvNotice } from '../../common/utils/env-notice.util';

export default registerAs('app', () => {
  const key = process.env.APP_KEY;
  if (!key || key === 'default_secret_key') {
    printMissingEnvNotice(
      'APP_KEY',
      'base64:IDRLehLNz0tQ4v6XPZ2SZnzVlTjyXxjcXRjb2v93Tjo=',
      'Khóa mã hóa chính của ứng dụng (dùng cho Webhook HMAC, mã hóa lưu trữ & credentials)',
    );
  }

  return {
    name: process.env.APP_NAME || 'NestJS Core Framework',
    env: process.env.APP_ENV || 'development',
    key,
    debug: process.env.APP_DEBUG === 'true',
    port: parseInt(process.env.APP_PORT || '3000', 10),
    url: process.env.APP_URL || 'http://localhost:3000',
    apiPrefix: process.env.API_PREFIX || 'api/v1',
    timezone: process.env.APP_TIMEZONE || 'Asia/Ho_Chi_Minh',
    locale: process.env.APP_LOCALE || 'vi',
    fallbackLocale: process.env.APP_FALLBACK_LOCALE || 'en',
    currency: process.env.APP_CURRENCY || 'VND',
    corsAllowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  };
});
