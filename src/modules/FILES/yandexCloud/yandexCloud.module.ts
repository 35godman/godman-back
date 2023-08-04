import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../user/user.schema';
import { WinstonModule } from 'nest-winston';
import { UserController } from '../../user/user.controller';
import { UserService } from '../../user/user.service';
import { YandexCloudService } from './yandexCloud.service';

@Module({
  imports: [WinstonModule],
  controllers: [],
  providers: [YandexCloudService],
  exports: [YandexCloudService],
})
export class YandexCloudModule {}
