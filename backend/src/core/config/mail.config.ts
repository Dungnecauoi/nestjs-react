import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  mailer: process.env.MAIL_MAILER || 'log', // log | smtp | ses | resend
  host: process.env.MAIL_HOST || '127.0.0.1',
  port: parseInt(process.env.MAIL_PORT || '2525', 10),
  username: process.env.MAIL_USERNAME === 'null' ? undefined : process.env.MAIL_USERNAME,
  password: process.env.MAIL_PASSWORD === 'null' ? undefined : process.env.MAIL_PASSWORD,
  fromAddress: process.env.MAIL_FROM_ADDRESS || 'info@example.com',
  fromName: process.env.MAIL_FROM_NAME || 'NestJS App',
}));
