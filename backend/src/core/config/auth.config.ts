import { registerAs } from '@nestjs/config';
import { printMissingEnvNotice } from '../../common/utils/env-notice.util';

export default registerAs('auth', () => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret === 'super_secret_key') {
    printMissingEnvNotice(
      'JWT_SECRET',
      'c06734389fab4f0afa9bcbcba8c22f2715cf383e0e926c38120c9ddbb3be53a41132a2ef236326fbdd0d3b868a9a1548c109903ea19fde1465c58910dd434fdc',
      'Khóa bí mật dùng để ký và xác thực Access Token JWT',
    );
  }

  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!jwtRefreshSecret || jwtRefreshSecret === 'super_refresh_secret') {
    printMissingEnvNotice(
      'JWT_REFRESH_SECRET',
      '8a4b4fbaff93765851f0de228a2201a045448474f955ac5a84bdc91039a44261deff86aec3c1ed602b12148e97cb058e07e002631652481b5ca289c7f7d867ea',
      'Khóa bí mật dùng để ký và xác thực Refresh Token (HttpOnly Cookie)',
    );
  }

  return {
    driver: process.env.AUTH_DRIVER || 'jwt-bearer',
    jwtSecret,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '5m',
    jwtRefreshSecret,
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    jwtRememberMeExpiresIn: process.env.JWT_REMEMBER_ME_EXPIRES_IN || '30d',
    cookieName: process.env.AUTH_COOKIE_NAME || 'ecomcx_session',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    sessionDriver: process.env.SESSION_DRIVER || 'redis',
    sessionLifetime: parseInt(process.env.SESSION_LIFETIME || '120', 10),
    enableCsrf: process.env.ENABLE_CSRF === 'true',
  };
});
