import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AskChatDto {
  // @IsString()
  // @IsNotEmpty()
  question: string;
  // @IsUUID()
  user_id: string;
  // @IsUUID()
  chatbot_id: string;
}
