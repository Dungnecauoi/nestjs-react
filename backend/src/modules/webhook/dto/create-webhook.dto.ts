import { IsString, IsUrl, IsOptional, IsArray } from 'class-validator';

export class CreateWebhookDto {
  @IsString()
  name: string;

  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  secret?: string;

  @IsArray()
  @IsString({ each: true })
  events: string[];
}
