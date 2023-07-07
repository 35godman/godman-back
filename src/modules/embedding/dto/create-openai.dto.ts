import { Chatbot } from '../../chatbot/chatbot.schema';

export class EmbeddingCreateOpenAIDto {
  question: string;
  user_id: string;
  chatbot: Chatbot;
}
