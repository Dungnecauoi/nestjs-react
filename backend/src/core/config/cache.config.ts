import { registerAs } from '@nestjs/config';

export default registerAs('cache', () => ({
  store: process.env.CACHE_STORE || 'memory', // memory | redis | file
  prefix: process.env.CACHE_PREFIX || 'app_cache_',
  redisHost: process.env.REDIS_HOST || '127.0.0.1',
  redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
  redisPassword: process.env.REDIS_PASSWORD === 'null' ? undefined : process.env.REDIS_PASSWORD,
}));
