import { FileUploadDto } from './file-upload.dto';
import { IsUUID } from 'class-validator';

export class MultipleFileUploadDto {
  @IsUUID()
  chatbot_id: string;
}
