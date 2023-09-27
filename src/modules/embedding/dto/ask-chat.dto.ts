import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export type ConversationEmbedding = {
  _id: string;
  content: string;
  role: 'user' | 'assistant';
};

export class AskChatDto {
  @IsString()
  question: string;
  @IsMongoId()
  chatbot_id: string;
  @IsString()
  @IsOptional()
  conversation_id?: string;
  @IsArray()
  messages: ConversationEmbedding[];
}
