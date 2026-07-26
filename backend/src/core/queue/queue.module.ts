import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailProcessor } from './processors/mail.processor';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('redis.host') || '127.0.0.1',
          port: config.get<number>('redis.port') || 6379,
          password: config.get<string>('redis.password') || undefined,
          enableOfflineQueue: false,
          maxRetriesPerRequest: null,
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'mail',
    }),
  ],
  controllers: [QueueController],
  providers: [QueueService, MailProcessor],
  exports: [QueueService, BullModule],
})
export class QueueModule {}
