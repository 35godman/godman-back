import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../user/user.schema';
import { ChatbotSettings } from './chatbotSettings.schema';
import { QAState } from '../types/QA.type';
import { WebContent } from '../types/web-content.type';
import { FileUpload } from '../../fileUpload/fileUpload.schema';

export type ChatbotSourcesDocument = HydratedDocument<ChatbotSources>;
@Schema({ timestamps: true })
export class ChatbotSources {
  @Prop([FileUpload])
  files: FileUpload[];

  @Prop()
  text: string;

  @Prop()
  website: WebContent[];

  @Prop()
  QA_list: QAState[];
}

export const ChatbotSourcesSchema =
  SchemaFactory.createForClass(ChatbotSources);
