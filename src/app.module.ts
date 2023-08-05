import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'dotenv';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { LoggerModule } from './modules/logger/logger.module';
import { EmbeddingModule } from './modules/embedding/embedding.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { CrawlerModule } from './modules/crawler/crawler.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConversationModule } from './modules/conversation/conversation.module';
import { PineconeModule } from './modules/pinecone/pinecone.module';
import { YandexCloudModule } from './modules/FILES/yandexCloud/yandexCloud.module';
import { FileUploadModule } from './modules/FILES/fileUpload/fileUpload.module';
import { ChatbotController } from './modules/chatbot/chatbot.controller';
import { SettingsController } from './modules/chatbot/settings/settings.controller';
import { ChatbotService } from './modules/chatbot/chatbot.service';
import { SettingsService } from './modules/chatbot/settings/settings.service';
import { SourcesService } from './modules/chatbot/sources/sources.service';
import { SourcesController } from './modules/chatbot/sources/sources.controller';
import { PineconeService } from './modules/pinecone/pinecone.service';
config();
@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URL),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
      serveRoot: '/static',
    }),
    UserModule,
    AuthModule,
    LoggerModule,
    YandexCloudModule,
    EmbeddingModule,
    ChatbotModule,
    FileUploadModule,
    CrawlerModule,
    ConversationModule,
    PineconeModule,
  ],
  controllers: [
    AppController,
    ChatbotController,
    SettingsController,
    SourcesController,
  ],
  providers: [
    AppService,
    {
      provide: 'WinstonLogger',
      useExisting: WINSTON_MODULE_PROVIDER,
    },
    ChatbotService,
    SettingsService,
    SourcesService,
    PineconeService,
  ],
  exports: ['WinstonLogger'],
})
export class AppModule {}
