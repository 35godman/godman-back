import { ChatbotSettingsDocument } from '../schemas/chatbotSettings.schema';
import {
  IsMongoId,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsUUID,
} from 'class-validator';
import { ChatbotDocument } from '../chatbot.schema';

export class UpdateSettingsDto {
  @IsObject()
  @IsNotEmptyObject()
  chatbot: Partial<ChatbotDocument>;
  @IsMongoId()
  chatbot_id: string;
}
