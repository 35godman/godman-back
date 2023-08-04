import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class RemoveUploadedFileDto {
  @IsString()
  @IsNotEmpty()
  original_name: string;
  @IsMongoId()
  file_id: string;
}
