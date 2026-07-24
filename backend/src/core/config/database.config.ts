import { registerAs } from '@nestjs/config';

export interface DatabaseConnectionOptions {
  driver: string;
  url?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  [key: string]: any;
}

export default registerAs('database', () => {
  const connections: Record<string, DatabaseConnectionOptions> = {};

  // 1. Primary Default Connection
  const primaryDriver = process.env.DB_CONNECTION || 'mysql';
  const primaryHost = process.env.DB_HOST || '127.0.0.1';
  const primaryPort = parseInt(process.env.DB_PORT || '3306', 10);
  const primaryDb = process.env.DB_DATABASE || 'nestjs_core';
  const primaryUser = process.env.DB_USERNAME || 'root';
  const primaryPass = process.env.DB_PASSWORD || '';

  connections['primary'] = {
    driver: primaryDriver,
    host: primaryHost,
    port: primaryPort,
    database: primaryDb,
    username: primaryUser,
    password: primaryPass,
    url:
      process.env.DATABASE_URL ||
      `${primaryDriver}://${primaryUser}:${primaryPass}@${primaryHost}:${primaryPort}/${primaryDb}`,
  };

  // 2. Dynamic Scanner for UNLIMITED Database Connections from process.env
  // Parses any env variable like DB_LOGS_URL, DB_TENANT_01_URL, DB_CRM_URL, SECOND_DATABASE_URL
  Object.keys(process.env).forEach((envKey) => {
    // Legacy support for SECOND_DATABASE_URL / MONGO_DATABASE_URL
    if (envKey === 'SECOND_DATABASE_URL' && process.env.SECOND_DATABASE_URL) {
      connections['secondary'] = {
        driver: process.env.DB2_CONNECTION || 'mysql',
        url: process.env.SECOND_DATABASE_URL,
      };
    } else if (
      envKey === 'MONGO_DATABASE_URL' &&
      process.env.MONGO_DATABASE_URL
    ) {
      connections['mongodb'] = {
        driver: 'mongodb',
        url: process.env.MONGO_DATABASE_URL,
      };
    }

    // Dynamic scanning pattern: DB_<NAME>_URL (e.g. DB_TENANT1_URL, DB_ANALYTICS_URL, DB_POSTGRES_URL)
    if (
      envKey.startsWith('DB_') &&
      envKey.endsWith('_URL') &&
      envKey !== 'DATABASE_URL'
    ) {
      const connName = envKey
        .replace(/^DB_/, '')
        .replace(/_URL$/, '')
        .toLowerCase();

      const urlValue = process.env[envKey];
      if (urlValue) {
        // Extract driver scheme automatically (e.g. postgresql:// -> postgresql, mongodb:// -> mongodb, mysql:// -> mysql)
        const driverMatch = urlValue.match(/^([a-z0-9]+):\/\//i);
        const driver = driverMatch ? driverMatch[1].toLowerCase() : 'unknown';

        connections[connName] = {
          driver,
          url: urlValue,
        };
      }
    }
  });

  return {
    default: process.env.DB_CONNECTION || 'mysql',
    connections,
  };
});
