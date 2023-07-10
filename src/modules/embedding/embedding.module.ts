import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/user.schema';
import { WinstonModule } from 'nest-winston';
import { UserController } from '../user/user.controller';
import { UserService } from '../user/user.service';
import { YandexCloudService } from '../yandexCloud/yandexCloud.service';
import { EmbeddingController } from './embedding.controller';
import { EmbeddingService } from './embedding.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    WinstonModule,
  ],
  controllers: [EmbeddingController],
  providers: [EmbeddingService, YandexCloudService],
  exports: [],
})
export class EmbeddingModule {}
