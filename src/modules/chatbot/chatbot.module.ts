import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/user.schema';
import { WinstonModule } from 'nest-winston';
import { UserController } from '../user/user.controller';
import { UserService } from '../user/user.service';
import { ChatbotController } from './chatbot.controller';
import { SourcesService } from './sources/sources.service';
import { SettingsService } from './settings/settings.service';
import { ChatbotService } from './chatbot.service';
import { Chatbot, ChatbotSchema } from './schemas/chatbot.schema';
import {
  ChatbotSettings,
  ChatbotSettingsSchema,
} from './schemas/chatbotSettings.schema';
import {
  ChatbotSources,
  ChatbotSourcesSchema,
} from './schemas/chatbotSources.schema';
import { YandexCloudService } from '../FILES/yandexCloud/yandexCloud.service';
import { PineconeService } from '../pinecone/pinecone.service';
import { SettingsController } from './settings/settings.controller';
import { SourcesController } from './sources/sources.controller';
import { FileUploadService } from '../FILES/fileUpload/fileUpload.service';
import { FileUploadModule } from '../FILES/fileUpload/fileUpload.module';
import {
  FileUpload,
  FileUploadSchema,
} from '../FILES/fileUpload/fileUpload.schema';

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
    forwardRef(() => FileUploadModule),
  ],
  controllers: [ChatbotController, SettingsController, SourcesController],
  providers: [
    SourcesService,
    SettingsService,
    ChatbotService,
    PineconeService,
    YandexCloudService,
  ],
  exports: [MongooseModule, ChatbotService, SettingsService, SourcesService],
})
export class ChatbotModule {}
