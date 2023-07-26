import { IsMongoId, IsNumber, IsString } from 'class-validator';

export class TextUploadDto {
  @IsMongoId()
  chatbot_id: string;
  @IsString()
  data: string;
}

export class UploadTextFromDataSourceDto {
  @IsMongoId()
  chatbot_id: string;
  @IsString()
  data: string;
  @IsNumber()
  char_length: number;
}
