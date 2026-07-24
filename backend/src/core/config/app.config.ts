import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: process.env.APP_NAME || 'NestJS Core Framework',
  env: process.env.APP_ENV || 'development',
  key: process.env.APP_KEY || 'default_secret_key',
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
}));
