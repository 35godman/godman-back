import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/user.schema';
import { WinstonModule } from 'nest-winston';
import { EmbeddingController } from '../embedding/embedding.controller';
import { EmbeddingService } from '../embedding/embedding.service';
import { YandexCloudService } from '../yandexCloud/yandexCloud.service';
import { FileUploadController } from './fileUpload.controller';
import { FileUploadService } from './fileUpload.service';
import { FileUpload, FileUploadSchema } from './fileUpload.schema';
import { JwtModule } from '@nestjs/jwt';
import { ChatbotService } from '../chatbot/chatbot.service';
import { Chatbot, ChatbotSchema } from '../chatbot/schemas/chatbot.schema';
import {
  ChatbotSources,
  ChatbotSourcesSchema,
} from '../chatbot/schemas/chatbotSources.schema';
import { UserService } from '../user/user.service';
import { ChatbotSettingsService } from '../chatbot/chatbotSettings.service';
import {
  ChatbotSettings,
  ChatbotSettingsSchema,
} from '../chatbot/schemas/chatbotSettings.schema';
import { ChatbotSourcesService } from '../chatbot/chatbotSources.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FileUpload.name, schema: FileUploadSchema },
      { name: User.name, schema: UserSchema },
      { name: Chatbot.name, schema: ChatbotSchema },
      { name: ChatbotSources.name, schema: ChatbotSourcesSchema },
      { name: ChatbotSettings.name, schema: ChatbotSettingsSchema },
    ]),
    WinstonModule,
    JwtModule,
  ],
  controllers: [FileUploadController],
  providers: [
    FileUploadService,
    YandexCloudService,
    ChatbotService,
    ChatbotSettingsService,
    ChatbotSourcesService,
  ],
  exports: [],
})
export class FileUploadModule {}
