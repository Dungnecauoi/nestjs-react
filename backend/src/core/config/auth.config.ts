import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret === 'super_secret_key') {
    throw new Error(
      'CRITICAL SECURITY FAIL: JWT_SECRET environment variable is missing or insecure default in auth.config.ts!',
    );
  }

  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!jwtRefreshSecret || jwtRefreshSecret === 'super_refresh_secret') {
    throw new Error(
      'CRITICAL SECURITY FAIL: JWT_REFRESH_SECRET environment variable is missing or insecure default in auth.config.ts!',
    );
  }

  return {
    driver: process.env.AUTH_DRIVER || 'jwt-bearer', // 'jwt-bearer' | 'jwt-cookie' | 'api-key'
    jwtSecret,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '5m',
    jwtRefreshSecret,
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    // "Ghi nhớ đăng nhập": khi user tick chọn, refresh token/session sống lâu hơn hẳn mặc định.
    jwtRememberMeExpiresIn: process.env.JWT_REMEMBER_ME_EXPIRES_IN || '30d',
  cookieName: process.env.AUTH_COOKIE_NAME || 'ecomcx_session',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  sessionDriver: process.env.SESSION_DRIVER || 'redis',
  sessionLifetime: parseInt(process.env.SESSION_LIFETIME || '120', 10),
    enableCsrf: process.env.ENABLE_CSRF === 'true',
  };
});
