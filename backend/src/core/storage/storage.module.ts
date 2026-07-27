import { Global, Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageConfigService } from './storage-config.service';

@Global()
@Module({
  providers: [StorageService, StorageConfigService],
  exports: [StorageService, StorageConfigService],
})
export class StorageModule {}
