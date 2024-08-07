import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../user/user.schema';
import { ChatbotSources } from '../../chatbot/schemas/chatbotSources.schema';
import { Chatbot, ChatbotDocument } from '../../chatbot/schemas/chatbot.schema';
export type FileUploadDocument = HydratedDocument<FileUpload>;
@Schema({ timestamps: true })
export class FileUpload {
  // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  // user: User;
  //
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Chatbot' })
  chatbot: ChatbotDocument;

  @Prop({ type: Number })
  char_length: number;

  @Prop({ type: String })
  originalName: string;

  @Prop({ type: String })
  storagePath: string;
}
export const FileUploadSchema = SchemaFactory.createForClass(FileUpload);
