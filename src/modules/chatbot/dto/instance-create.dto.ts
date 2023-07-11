import { ChatbotSettings } from '../schemas/chatbotSettings.schema';
import { ChatbotSources } from '../schemas/chatbotSources.schema';

export class CreateChatbotInstanceDto {
  settings: ChatbotSettings;
  sources: ChatbotSources;
  user_id: string;
}
