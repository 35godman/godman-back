import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from '../../user/user.schema';
import { ChatbotSettings } from './chatbotSettings.schema';
import { Chatbot } from '../chatbot.schema';

@Schema({ timestamps: true })
export class ChatbotConversations {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Chatbot' })
  chatbot_id: Chatbot;

  @Prop([ChatbotConversations])
  conversations: ChatbotConversations[];
}

export const ChatbotConversationsSchema =
  SchemaFactory.createForClass(ChatbotConversations);
