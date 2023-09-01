import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/user.schema';
import { WinstonModule } from 'nest-winston';
import { EmbeddingController } from './embedding.controller';
import { EmbeddingService } from './embedding.service';
import { Chatbot, ChatbotSchema } from '../chatbot/schemas/chatbot.schema';
import {
  ChatbotSettings,
  ChatbotSettingsSchema,
} from '../chatbot/schemas/chatbotSettings.schema';
import {
  ChatbotSources,
  ChatbotSourcesSchema,
} from '../chatbot/schemas/chatbotSources.schema';
import { FileUploadModule } from '../FILES/fileUpload/fileUpload.module';
import {
  FileUpload,
  FileUploadSchema,
} from '../FILES/fileUpload/fileUpload.schema';
import { YandexCloudModule } from '../FILES/yandexCloud/yandexCloud.module';
import { ConversationService } from '../conversation/conversation.service';
import {
  Conversation,
  ConversationSchema,
} from '../conversation/conversation.schema';
import { PineconeService } from '../pinecone/pinecone.service';
import { ChatbotModule } from '../chatbot/chatbot.module';
import { RedisModule } from '../redis/redis.module';
import { RateLimitService } from '../rate-limit/rate-limit.service';
import { FrameAncestorsMiddleware } from '../../middlewares/frame-ancestors.middleware';
import { PdfService } from '../conversation/pdfService';

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
    RedisModule,
  ],
  controllers: [EmbeddingController],
  providers: [
    PdfService,
    EmbeddingService,
    PineconeService,
    ConversationService,
    RateLimitService,
  ],
  exports: [EmbeddingService],
})
export class EmbeddingModule {}
