import { IsMongoId, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CrawlDto {
  @IsString()
  @IsNotEmpty()
  weblink: string;
  @IsMongoId()
  chatbot_id: string;
}
