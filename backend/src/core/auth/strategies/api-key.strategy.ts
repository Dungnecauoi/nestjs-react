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
    // passReqToCallback=false (mặc định): passport-headerapikey nối `req` vào SAU callback
    // `verified` khi bật true, làm lệch vị trí tham số cuối mà NestJS's PassportStrategy mixin
    // coi là `done` — gây "done is not a function" khi strategy này chạy thật lần đầu.
    super({ header: 'x-api-key', prefix: '' }, false);
  }

  async validate(apiKey: string) {
    const user = await this.apiKeyService.validateKey(apiKey);
    if (!user) {
      throw new UnauthorizedException('API Key không hợp lệ hoặc đã hết hạn!');
    }
    return user;
  }
}
