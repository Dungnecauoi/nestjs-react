import { Module, Global } from '@nestjs/common';
import { OptionsService } from './options.service';
import { OptionsController } from './options.controller';

@Global()
@Module({
  controllers: [OptionsController],
  providers: [OptionsService],
  exports: [OptionsService],
})
export class OptionsModule {}
