import { FileUploadDto } from './file-upload.dto';
import { IsMongoId, IsUUID } from 'class-validator';

export class MultipleFileUploadDto {
  @IsMongoId()
  chatbot_id: string;
}
