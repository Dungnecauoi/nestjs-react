import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { ApiKeyStrategy } from './strategies/api-key.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { ApiKeyGuard } from './guards/api-key.guard';
import { JwtOrApiKeyGuard } from './guards/jwt-or-api-key.guard';
import { PermissionGuard } from './guards/permission.guard';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TwoFactorService } from './two-factor.service';
import { ApiKeyService } from './api-key/api-key.service';
import { ApiKeyController } from './api-key/api-key.controller';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('auth.jwtSecret') || 'super_secret_key',
        signOptions: {
          expiresIn: (config.get<string>('auth.jwtExpiresIn') || '7d') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController, ApiKeyController],
  providers: [
    AuthService,
    TwoFactorService,
    ApiKeyService,
    JwtStrategy,
    JwtRefreshStrategy,
    ApiKeyStrategy,
    JwtAuthGuard,
    JwtRefreshGuard,
    ApiKeyGuard,
    JwtOrApiKeyGuard,
    PermissionGuard,
  ],
  exports: [
    AuthService,
    TwoFactorService,
    ApiKeyService,
    JwtModule,
    PassportModule,
    JwtStrategy,
    JwtRefreshStrategy,
    ApiKeyStrategy,
    JwtAuthGuard,
    JwtRefreshGuard,
    ApiKeyGuard,
    JwtOrApiKeyGuard,
    PermissionGuard,
  ],
})
export class AuthModule {}
