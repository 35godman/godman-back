import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { VisibilityOptions } from '../types/visibility.type';
import { LimitState } from '../types/limit.type';
import { CustomerInfo } from '../types/customer-info.type';
import { ChatbotConversations } from './chatbotConversations.schema';
import { HydratedDocument } from 'mongoose';

export type ChatbotSettingsDocument = HydratedDocument<ChatbotSettings>;
@Schema({ timestamps: true })
export class ChatbotSettings {
  @Prop({ default: 'gpt-3.5-turbo' })
  model: string;

  @Prop({ default: 'english' })
  language: string;

  @Prop()
  num_of_characters: number;

  @Prop()
  max_tokens: number;

  @Prop()
  temperature: number;

  @Prop()
  base_prompt: string;

  @Prop()
  visibility: VisibilityOptions;

  @Prop()
  domains: string[];

  @Prop({
    type: {
      messages_limit: Number,
      seconds: Number,
      limit_end_message: String,
    },
  })
  rate_limit: LimitState;

  @Prop({
    type: { title: String, name: Boolean, email: Boolean, phone: Boolean },
  })
  customer_info: CustomerInfo;

  @Prop()
  initial_messages: string[];

  @Prop()
  suggested_messages: string[];

  @Prop()
  theme: 'light' | 'dark';

  @Prop()
  profile_picture_path: string;

  @Prop()
  display_name: string;

  @Prop()
  user_message_color: string;

  @Prop()
  bot_message_color: string;

  @Prop()
  chat_icon_path: string;

  @Prop()
  chat_bubble_color: string;

  @Prop()
  show_initial_messages_timeout: number;
}
export const ChatbotSettingsSchema =
  SchemaFactory.createForClass(ChatbotSettings);
