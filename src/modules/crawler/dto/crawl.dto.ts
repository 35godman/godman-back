import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';
import { FileUpload } from '../../FILES/fileUpload/fileUpload.schema';

export class CrawlDto {
  @IsString()
  @IsNotEmpty()
  weblink: string;
  @IsArray()
  filter?: string[];
  @IsArray()
  alreadyUploadedLinks: FileUpload[];
}
