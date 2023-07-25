import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from '../../user/user.schema';
import { ChatbotSettings } from './chatbotSettings.schema';
import { Chatbot } from '../chatbot.schema';
import { Conversation } from '../../conversation/conversation.schema';

@Schema({ timestamps: true })
export class ChatbotConversations {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Chatbot' })
  chatbot_id: Chatbot;

  @Prop({ default: [] })
  conversations: Conversation[];
}

export const ChatbotConversationsSchema =
  SchemaFactory.createForClass(ChatbotConversations);
