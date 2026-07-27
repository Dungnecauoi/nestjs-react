import { Injectable } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MediaService } from './media.service';
import { CustomLoggerService } from '../../core/logger/logger.service';

export interface MediaProcessingJobData {
  mediaId: string;
}

@Injectable()
@Processor('media-processing')
export class MediaProcessor extends WorkerHost {
  constructor(
    private readonly mediaService: MediaService,
    private readonly logger: CustomLoggerService,
  ) {
    super();
  }

  async process(job: Job<MediaProcessingJobData>): Promise<void> {
    this.logger.log(`[MediaProcessor] Xử lý media ID: ${job.data.mediaId}`, 'MediaProcessor');
    await this.mediaService.processMediaFile(job.data.mediaId);
    this.logger.log(`[MediaProcessor] Hoàn tất media ID: ${job.data.mediaId}`, 'MediaProcessor');
  }
}
