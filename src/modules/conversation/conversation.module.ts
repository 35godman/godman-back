import { Module } from '@nestjs/common';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { ChatbotService } from '../chatbot/chatbot.service';
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
import { Conversation, ConversationSchema } from './conversation.schema';
import { ChatbotSettingsService } from '../chatbot/chatbotSettings.service';
import { ChatbotSourcesService } from '../chatbot/chatbotSources.service';
import { YandexCloudService } from '../yandexCloud/yandexCloud.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: Chatbot.name, schema: ChatbotSchema },
      {
        name: ChatbotSettings.name,
        schema: ChatbotSettingsSchema,
      },
      { name: ChatbotSources.name, schema: ChatbotSourcesSchema },
    ]),
    WinstonModule,
  ],
  controllers: [ConversationController],
  providers: [
    ConversationService,
    ChatbotService,
    ChatbotSettingsService,
    ChatbotSourcesService,
    YandexCloudService,
  ],
})
export class ConversationModule {}
