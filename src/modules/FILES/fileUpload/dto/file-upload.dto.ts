import { IsMongoId, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class FileUploadDto {
  @IsNotEmpty()
  fileName: string;
  @IsNotEmpty()
  data: Buffer | string;
  @IsMongoId()
  chatbot_id: string;
  @IsNumber()
  char_length: number;
}
