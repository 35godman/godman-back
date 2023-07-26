import { IsMongoId, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class RemoveWebCrawledFileDto {
  @IsString()
  @IsNotEmpty()
  web_link: string;
  @IsMongoId()
  chatbot_id: string;
  @IsMongoId()
  weblink_id: string;
}
