import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  driver: process.env.AUTH_DRIVER || 'jwt-bearer', // 'jwt-bearer' | 'jwt-cookie' | 'api-key'
  jwtSecret: process.env.JWT_SECRET || 'super_secret_key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '5m',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'super_refresh_secret',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  cookieName: process.env.AUTH_COOKIE_NAME || 'ecomcx_session',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  sessionDriver: process.env.SESSION_DRIVER || 'redis',
  sessionLifetime: parseInt(process.env.SESSION_LIFETIME || '120', 10),
  enableCsrf: process.env.ENABLE_CSRF === 'true',
}));
