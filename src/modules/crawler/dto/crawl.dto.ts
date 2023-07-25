import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CrawlDto {
  @IsString()
  @IsNotEmpty()
  weblink: string;
  @IsUUID()
  chatbot_id: string;
}
