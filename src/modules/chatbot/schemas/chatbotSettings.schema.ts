import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { VisibilityOptions } from '../types/visibility.type';
import { LimitState } from '../types/limit.type';
import { CustomerInfo } from '../types/customer-info.type';
import mongoose, { HydratedDocument } from 'mongoose';
import { Chatbot } from '../chatbot.schema';

export type ChatbotSettingsDocument = HydratedDocument<ChatbotSettings>;
@Schema({ timestamps: true })
export class ChatbotSettings {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Chatbot' })
  chatbot_id: Chatbot;

  @Prop({ default: 'gpt-3.5-turbo' })
  model: string;

  @Prop({ default: 'english' })
  language: string;

  @Prop({ default: 0 })
  num_of_characters: number;

  @Prop({ default: 2000000 })
  char_limit: number;

  @Prop({ default: 1000 })
  max_tokens: number;

  @Prop({ default: 1 })
  temperature: number;

  @Prop({
    default:
      "I want you to act as a document that I am having a conversation with. Your name is 'AI Assistant'. You will provide me with answers from the given info. If the answer is not included, say exactly 'Hmm, I am not sure.' and stop after that. Refuse to answer any question not about the info. Never break character.",
  })
  base_prompt: string;

  @Prop({ default: 'private' })
  visibility: VisibilityOptions;

  @Prop({ default: [] })
  domains: string[];

  @Prop({
    type: {
      messages_limit: Number,
      seconds: Number,
      limit_end_message: String,
    },
    default: {
      messages_limit: 20,
      seconds: 30,
      limit_end_message: 'Limit ended',
    },
  })
  rate_limit: LimitState;

  @Prop({
    type: {
      title: String,
      name_checked: Boolean,
      name: String,
      email_checked: Boolean,
      email: String,
      phone_checked: Boolean,
      phone: String,
    },
    default: {
      title: 'Your title',
      name_checked: false,
      name: '',
      email_checked: false,
      email: '',
      phone_checked: false,
      phone: '',
    },
  })
  customer_info: CustomerInfo;

  @Prop({ default: [] })
  initial_messages: string[];

  @Prop({ default: [] })
  suggested_messages: string[];

  @Prop({ default: 'light' })
  theme: 'light' | 'dark';

  @Prop({
    default: `${process.env.BACKEND_DOMAIN_NAME}/static/icons/icons8-chatbot-96.png`,
  })
  profile_picture_path: string;

  @Prop({ default: false })
  remove_profile_picture_checked: boolean;

  @Prop({ default: 'Chatbot' })
  display_name: string;

  @Prop({ default: '#E3E5E8' })
  user_message_color: string;

  @Prop({ default: '#E3E5E8' })
  bot_message_color: string;

  @Prop({ default: 'static/icons/icons8-chatbot-96.png' })
  chat_icon_path: string;

  @Prop({ default: '#E3E5E8' })
  chat_bubble_color: string;

  @Prop({ default: 1000 })
  show_initial_messages_timeout: number;
}
export const ChatbotSettingsSchema =
  SchemaFactory.createForClass(ChatbotSettings);
