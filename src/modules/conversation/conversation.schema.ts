import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from '../user/user.schema';
import { MessageState } from './types/message.type';
import { Chatbot } from '../chatbot/chatbot.schema';

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Chatbot' })
  chatbot_id: Chatbot;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  owner: User;

  @Prop()
  username: string;

  @Prop()
  password: string;

  @Prop()
  messages: MessageState[];

  @Prop()
  source: string;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
