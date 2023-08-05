import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/user.schema';
import { Chatbot, ChatbotSchema } from '../chatbot/schemas/chatbot.schema';
import {
  ChatbotSettings,
  ChatbotSettingsSchema,
} from '../chatbot/schemas/chatbotSettings.schema';
import {
  ChatbotSources,
  ChatbotSourcesSchema,
} from '../chatbot/schemas/chatbotSources.schema';
import { WinstonModule } from 'nest-winston';
import { EmbeddingController } from '../embedding/embedding.controller';
import { EmbeddingService } from '../embedding/embedding.service';
import { YandexCloudService } from '../FILES/yandexCloud/yandexCloud.service';
import { ChatbotService } from '../chatbot/chatbot.service';
import { CrawlerController } from './crawler.controller';
import { CrawlerService } from './crawler.service';
import { UserModule } from '../user/user.module';
import { FileUploadService } from '../FILES/fileUpload/fileUpload.service';
import {
  FileUpload,
  FileUploadSchema,
} from '../FILES/fileUpload/fileUpload.schema';
import { SettingsService } from '../chatbot/settings/settings.service';
import { SourcesService } from '../chatbot/sources/sources.service';
import { PineconeService } from '../pinecone/pinecone.service';

@Module({
  imports: [
    WinstonModule,
    UserModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Chatbot.name, schema: ChatbotSchema },
      {
        name: ChatbotSettings.name,
        schema: ChatbotSettingsSchema,
      },
      { name: ChatbotSources.name, schema: ChatbotSourcesSchema },
      { name: FileUpload.name, schema: FileUploadSchema },
    ]),
  ],
  controllers: [CrawlerController],
  providers: [
    CrawlerService,
    YandexCloudService,
    ChatbotService,
    FileUploadService,
    SettingsService,
    SourcesService,
    PineconeService,
  ],
  exports: [],
})
export class CrawlerModule {}
