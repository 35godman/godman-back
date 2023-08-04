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
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'WinstonLogger',
      useExisting: WINSTON_MODULE_PROVIDER,
    },
  ],
  exports: ['WinstonLogger'],
})
export class AppModule {}
