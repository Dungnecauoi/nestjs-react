import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import HeaderAPIKeyStrategy from 'passport-headerapikey';
import { ApiKeyService } from '../api-key/api-key.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'api-key',
) {
  constructor(private readonly apiKeyService: ApiKeyService) {
    super(
      { header: 'x-api-key', prefix: '' },
      true,
    );
  }

  async validate(apiKey: string, done: (err: any, user?: any) => void) {
    const user = await this.apiKeyService.validateKey(apiKey);
    if (!user) {
      return done(new UnauthorizedException('API Key không hợp lệ hoặc đã hết hạn!'), false);
    }
    return done(null, user);
  }
}
