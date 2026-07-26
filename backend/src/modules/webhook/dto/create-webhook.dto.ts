import { IsString, IsUrl, IsArray } from 'class-validator';

export class CreateWebhookDto {
  @IsString()
  name: string;

  @IsUrl()
  url: string;

  // Secret luôn server-generate (xem WebhookService.create) — không nhận từ client.

  @IsArray()
  @IsString({ each: true })
  events: string[];
}
