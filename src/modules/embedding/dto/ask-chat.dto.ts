import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

export type UserMessageEmbedding = {
  _id: string;
  content: string;
  role: 'user';
};

export class AskChatDto {
  @IsString()
  question: string;
  @IsMongoId()
  chatbot_id: string;
  @IsString()
  conversation_id: string;
  @IsArray()
  user_messages: UserMessageEmbedding[];
}
