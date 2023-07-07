import { Prop, Schema } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from '../user/user.schema';
@Schema({ timestamps: true })
export class File {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop()
  originalName: string;

  @Prop()
  storagePath: string;
}
