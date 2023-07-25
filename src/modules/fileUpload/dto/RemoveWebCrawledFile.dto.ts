import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class RemoveWebCrawledFileDto {
  @IsString()
  @IsNotEmpty()
  web_link: string;
  @IsUUID()
  chatbot_id: string;
}
