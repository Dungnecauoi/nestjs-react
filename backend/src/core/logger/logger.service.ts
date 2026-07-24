import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
      dirname: './logs',
      filename: 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: process.env.LOG_MAX_FILES || '14d',
      level: process.env.LOG_LEVEL || 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    });

    const errorRotateFileTransport = new winston.transports.DailyRotateFile({
      dirname: './logs',
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    });

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'debug',
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.colorize({ all: true }),
            winston.format.printf(({ timestamp, level, message, context }) => {
              return `[NestCore] ${timestamp} [${level}] ${context ? `[${context}] ` : ''}${message}`;
            }),
          ),
        }),
        dailyRotateFileTransport,
        errorRotateFileTransport,
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
}
