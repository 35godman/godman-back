import { IsMongoId, IsNotEmpty, IsUUID } from 'class-validator';

export class FileUploadDto {
  @IsNotEmpty()
  fileName: string;
  @IsNotEmpty()
  data: Buffer | string;
  @IsMongoId()
  chatbot_id: string;
}
