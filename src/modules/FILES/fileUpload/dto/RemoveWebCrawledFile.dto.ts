import { IsMongoId, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class RemoveWebCrawledFileDto {
  @IsString()
  @IsNotEmpty()
  web_link: string;
  @IsMongoId()
  weblink_id: string;
}
