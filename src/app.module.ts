import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'dotenv';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { LoggerModule } from './modules/logger/logger.module';
import { YandexCloudModule } from './modules/yandexCloud/yandexCloud.module';
import { EmbeddingModule } from './modules/embedding/embedding.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { FileUploadModule } from './modules/fileUpload/fileUpload.module';
config();
@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URL),
    UserModule,
    AuthModule,
    LoggerModule,
    YandexCloudModule,
    EmbeddingModule,
    ChatbotModule,
    FileUploadModule,
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
