import { IsMongoId, IsNumber, IsString } from 'class-validator';

export class TextUploadDto {
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
