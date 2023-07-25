import { IsNotEmpty, IsUUID } from 'class-validator';

export class FileUploadDto {
  @IsNotEmpty()
  fileName: string;
  @IsNotEmpty()
  data: Buffer | string;
  @IsUUID()
  chatbot_id: string;
}
