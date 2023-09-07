import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/user.schema';
import { UserService } from '../user/user.service';
import * as dotenv from 'dotenv';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ChatbotService } from '../chatbot/chatbot.service';
import { RateLimitService } from '../rate-limit/rate-limit.service';
import { Chatbot, ChatbotSchema } from '../chatbot/schemas/chatbot.schema';
import { ChatbotModule } from '../chatbot/chatbot.module';
import { SettingsService } from '../chatbot/settings/settings.service';
import { SourcesService } from '../chatbot/sources/sources.service';
import { PineconeService } from '../pinecone/pinecone.service';
import { RedisModule } from '../redis/redis.module';
import { YandexCloudService } from '../FILES/yandexCloud/yandexCloud.service';

dotenv.config();

@Module({
  imports: [
    ChatbotModule,
    RedisModule,
    ChatbotModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '72h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    RateLimitService,
    PineconeService,
    YandexCloudService,
  ],
  exports: [AuthService, JwtModule], // Include JwtModule in exports
})
export class AuthModule {}
