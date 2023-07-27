import { IsMongoId, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddQnaDto {
  @IsNotEmpty()
  data: QnAState[];
}

export class UpdateQnADto {
  @IsNotEmpty()
  data: QnAState[];
  @IsNumber()
  char_length: number;
  @IsMongoId()
  chatbot_id: string;
}

export class QnAState {
  @IsMongoId()
  _id: string;
  @IsString()
  question: string;
  @IsString()
  answer: string;
}
