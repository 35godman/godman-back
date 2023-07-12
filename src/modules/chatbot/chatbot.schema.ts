import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { User } from '../user/user.schema';
import { VisibilityOptions } from './types/visibility.type';
import { LimitState } from './types/limit.type';
import { CustomerInfo } from './types/customer-info.type';
import { ChatbotSettings } from './schemas/chatbotSettings.schema';
import { EmbeddedCode } from './types/embed-code.type';
import { ChatbotConversations } from './schemas/chatbotConversations.schema';
import {
  ChatbotSources,
  ChatbotSourcesDocument,
} from './schemas/chatbotSources.schema';
import { Conversation } from '../conversation/conversation.schema';

export type ChatbotDocument = HydratedDocument<Chatbot>;

@Schema({ timestamps: true })
export class Chatbot {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  owner: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ChatbotSettings' })
  settings: ChatbotSettings;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' })
  conversations: Conversation[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ChatbotSources' })
  sources: ChatbotSourcesDocument;

  @Prop({
    default: null,
    type: {
      iframe: String,
      script: String,
    },
  })
  embed_code: EmbeddedCode;

  @Prop({ default: null })
  share_link: string;
}

export const ChatbotSchema = SchemaFactory.createForClass(Chatbot);
// export const ChatbotModel = Model<Chatbot>('Chatbot', ChatbotSchema);
