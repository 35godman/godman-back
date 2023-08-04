import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/user.schema';
import { WinstonModule } from 'nest-winston';
import { UserController } from '../user/user.controller';
import { UserService } from '../user/user.service';
import { ChatbotController } from './chatbot.controller';
import { ChatbotSourcesService } from './chatbotSources.service';
import { ChatbotSettingsService } from './chatbotSettings.service';
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
    ]),
    WinstonModule,
  ],
  controllers: [ChatbotController],
  providers: [
    ChatbotSourcesService,
    ChatbotSettingsService,
    ChatbotService,
    PineconeService,
    YandexCloudService,
  ],
  exports: [],
})
export class ChatbotModule {}
