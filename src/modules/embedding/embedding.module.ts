import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/user.schema';
import { WinstonModule } from 'nest-winston';
import { UserController } from '../user/user.controller';
import { UserService } from '../user/user.service';
import { YandexCloudService } from '../FILES/yandexCloud/yandexCloud.service';
import { EmbeddingController } from './embedding.controller';
import { EmbeddingService } from './embedding.service';
import { Chatbot, ChatbotSchema } from '../chatbot/schemas/chatbot.schema';
import { ChatbotService } from '../chatbot/chatbot.service';
import {
  ChatbotSettings,
  ChatbotSettingsSchema,
} from '../chatbot/schemas/chatbotSettings.schema';
import {
  ChatbotSources,
  ChatbotSourcesSchema,
} from '../chatbot/schemas/chatbotSources.schema';
import { FileUploadService } from '../FILES/fileUpload/fileUpload.service';
import { FileUploadModule } from '../FILES/fileUpload/fileUpload.module';
import {
  FileUpload,
  FileUploadSchema,
} from '../FILES/fileUpload/fileUpload.schema';
import { SettingsService } from '../chatbot/settings/settings.service';
import { SourcesService } from '../chatbot/sources/sources.service';
import { YandexCloudModule } from '../FILES/yandexCloud/yandexCloud.module';
import { ConversationService } from '../conversation/conversation.service';
import {
  Conversation,
  ConversationSchema,
} from '../conversation/conversation.schema';
import { PineconeService } from '../pinecone/pinecone.service';
import { ChatbotModule } from '../chatbot/chatbot.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Chatbot.name, schema: ChatbotSchema },
      {
        name: ChatbotSettings.name,
        schema: ChatbotSettingsSchema,
      },
      { name: ChatbotSources.name, schema: ChatbotSourcesSchema },
      { name: FileUpload.name, schema: FileUploadSchema },
      { name: Conversation.name, schema: ConversationSchema },
    ]),
    WinstonModule,
    YandexCloudModule,
    ChatbotModule,
    FileUploadModule,
  ],
  controllers: [EmbeddingController],
  providers: [EmbeddingService, PineconeService, ConversationService],
  exports: [EmbeddingService],
})
export class EmbeddingModule {}
