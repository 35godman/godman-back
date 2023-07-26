import { Chatbot } from '../../chatbot/chatbot.schema';
import { IsMongoId, IsUUID } from 'class-validator';

export class EmbeddingCreateOpenAIDto {
  question: string;
  @IsMongoId()
  user_id: string;

  chatbot: Chatbot;
}
