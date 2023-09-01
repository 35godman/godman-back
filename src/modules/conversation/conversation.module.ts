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
import { SettingsService } from '../chatbot/settings/settings.service';
import { SourcesService } from '../chatbot/sources/sources.service';
import { YandexCloudService } from '../FILES/yandexCloud/yandexCloud.service';
import { PineconeService } from '../pinecone/pinecone.service';
import { ChatbotModule } from '../chatbot/chatbot.module';
import { PdfService } from './pdfService';

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
    ChatbotModule,
  ],
  controllers: [ConversationController],
  providers: [
    PineconeService,
    ConversationService,
    YandexCloudService,
    PdfService,
  ],
})
export class ConversationModule {}
