import { ChatbotSettingsDocument } from '../schemas/chatbotSettings.schema';
import {
  IsMongoId,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsUUID,
} from 'class-validator';
import { ChatbotDocument } from '../schemas/chatbot.schema';

export class UpdateSettingsDto {
  @IsObject()
  @IsNotEmptyObject()
  chatbot: Partial<ChatbotDocument>;
}
