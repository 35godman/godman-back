import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class RemoveUploadedFileDto {
  @IsString()
  @IsNotEmpty()
  original_name: string;
  @IsMongoId()
  chatbot_id: string;
  @IsMongoId()
  file_id: string;
}
