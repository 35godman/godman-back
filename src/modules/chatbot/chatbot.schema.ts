import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from '../user/user.schema';

@Schema({ timestamps: true })
export class Chatbot {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  owner: User;

  @Prop()
  model: 'gpt-3.5-turbo';

  @Prop()
  num_of_characters: number;

  @Prop()
  visibility: string;

  @Prop()
  max_tokens: number;

  @Prop()
  temperature: number;
}

export const ChatbotSchema = SchemaFactory.createForClass(Chatbot);
