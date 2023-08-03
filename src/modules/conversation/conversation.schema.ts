import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from '../user/user.schema';
import { MessageState } from './types/message.type';
import { Chatbot } from '../chatbot/schemas/chatbot.schema';

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Chatbot' })
  chatbot_id: Chatbot;

  @Prop({ default: [] })
  messages: MessageState[];

  @Prop({ default: '' })
  source: string;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
