import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

export class CrawlDto {
  @IsString()
  @IsNotEmpty()
  weblink: string;
  @IsArray()
  filter?: string[];
}
