import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../user/user.schema';
import { ChatbotSettings } from './chatbotSettings.schema';
import { QAState } from '../types/QA.type';
import { WebContent } from '../types/web-content.type';
import {
  FileUpload,
  FileUploadDocument,
} from '../../fileUpload/fileUpload.schema';
import { Chatbot } from './chatbot.schema';

export type ChatbotSourcesDocument = HydratedDocument<ChatbotSources>;
@Schema({ timestamps: true })
export class ChatbotSources {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chatbot',
    required: true,
  })
  chatbot_id: Chatbot;

  @Prop({ default: [] })
  files: FileUploadDocument[];

  @Prop({ default: '' })
  text: string;

  @Prop({ default: [] })
  website: FileUploadDocument[];

  @Prop({ default: null })
  crawling_status: null | 'FAILED' | 'PENDING' | 'COMPLETED';

  @Prop({ default: null })
  last_crawled_data: Date;

  @Prop({ default: [] })
  QA_list: QAState[];
}

export const ChatbotSourcesSchema =
  SchemaFactory.createForClass(ChatbotSources);
