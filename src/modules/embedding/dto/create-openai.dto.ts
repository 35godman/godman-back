import { Chatbot } from '../../chatbot/chatbot.schema';
import { IsUUID } from 'class-validator';

export class EmbeddingCreateOpenAIDto {
  question: string;
  @IsUUID()
  user_id: string;

  chatbot: Chatbot;
}
