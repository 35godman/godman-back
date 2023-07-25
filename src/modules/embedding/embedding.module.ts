import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/user.schema';
import { WinstonModule } from 'nest-winston';
import { UserController } from '../user/user.controller';
import { UserService } from '../user/user.service';
import { YandexCloudService } from '../yandexCloud/yandexCloud.service';
import { EmbeddingController } from './embedding.controller';
import { EmbeddingService } from './embedding.service';
import { Chatbot, ChatbotSchema } from '../chatbot/chatbot.schema';
import { ChatbotService } from '../chatbot/chatbot.service';
import {
  ChatbotSettings,
  ChatbotSettingsSchema,
} from '../chatbot/schemas/chatbotSettings.schema';
import {
  ChatbotSources,
  ChatbotSourcesSchema,
} from '../chatbot/schemas/chatbotSources.schema';
import { FileUploadService } from '../fileUpload/fileUpload.service';
import { FileUploadModule } from '../fileUpload/fileUpload.module';
import { FileUpload, FileUploadSchema } from '../fileUpload/fileUpload.schema';
import { ChatbotSettingsService } from '../chatbot/chatbotSettings.service';

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
    ]),
    WinstonModule,
  ],
  controllers: [EmbeddingController],
  providers: [
    EmbeddingService,
    YandexCloudService,
    ChatbotService,
    FileUploadService,
    ChatbotSettingsService,
  ],
  exports: [],
})
export class EmbeddingModule {}
