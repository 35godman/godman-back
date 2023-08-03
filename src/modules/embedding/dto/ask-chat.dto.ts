import { IsMongoId, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AskChatDto {
  @IsString()
  question: string;
  @IsMongoId()
  chatbot_id: string;
  @IsString()
  conversation_id: string;
}
