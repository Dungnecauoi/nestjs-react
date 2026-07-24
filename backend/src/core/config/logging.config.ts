import { registerAs } from '@nestjs/config';

export default registerAs('logging', () => ({
  channel: process.env.LOG_CHANNEL || 'daily', // daily | single | console
  level: process.env.LOG_LEVEL || 'debug', // debug | info | warn | error
  maxFiles: process.env.LOG_MAX_FILES || '14d',
}));
