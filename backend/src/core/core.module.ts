import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import {
  HeaderResolver,
  I18nModule,
  QueryResolver,
  AcceptLanguageResolver,
} from 'nestjs-i18n';
import * as path from 'path';

import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import databaseConfig from './config/database.config';
import cacheConfig from './config/cache.config';
import storageConfig from './config/storage.config';
import mailConfig from './config/mail.config';
import loggingConfig from './config/logging.config';

import { LoggerModule } from './logger/logger.module';
import { StorageModule } from './storage/storage.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { OptionsModule } from './options/options.module';

@Global()
@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    OptionsModule,
    // 1. Central Configuration Module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [
        appConfig,
        authConfig,
        databaseConfig,
        cacheConfig,
        storageConfig,
        mailConfig,
        loggingConfig,
      ],
    }),

    // 2. Multi-Language i18n Module
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.get<string>('app.fallbackLocale') || 'en',
        loaderOptions: {
          path: path.join(process.cwd(), 'src/i18n/'),
          watch: true,
        },
      }),
      resolvers: [
        new QueryResolver(['lang', 'locale']),
        new HeaderResolver(['x-custom-lang']),
        new AcceptLanguageResolver(),
      ],
      inject: [ConfigService],
    }),

    // 3. Security Rate Limiter (Throttler)
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: parseInt(config.get('THROTTLE_TTL') || '60', 10),
          limit: parseInt(config.get('THROTTLE_LIMIT') || '100', 10),
        },
      ],
    }),

    // 4. Events & Scheduler Modules
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),

    // 5. Core Sub-modules
    LoggerModule,
    StorageModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [
    ConfigModule,
    I18nModule,
    LoggerModule,
    StorageModule,
    AuthModule,
    DatabaseModule,
  ],
})
export class CoreModule {}
