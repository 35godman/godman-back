import { IsMongoId, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CrawlDto {
  @IsString()
  @IsNotEmpty()
  weblink: string;
  @IsString()
  filter?: string;
}
