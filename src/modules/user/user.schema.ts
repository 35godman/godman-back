import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  email: string;

  @Prop({ default: 'free' })
  plan: 'premium' | 'free';

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 1 })
  chatbot_limit: number;

  @Prop()
  language: 'russian' | 'english';
}

export const UserSchema = SchemaFactory.createForClass(User);
