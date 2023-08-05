import { ChatbotSettingsDocument } from '../schemas/chatbotSettings.schema';
import {
  IsMongoId,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  IsUUID,
} from 'class-validator';
import { ChatbotDocument } from '../schemas/chatbot.schema';

export class UpdateSettingsDto {
  @IsObject()
  @IsNotEmptyObject()
  chatbot_settings: Partial<ChatbotSettingsDocument>;
  @IsString()
  chatbot_name: string;
}
