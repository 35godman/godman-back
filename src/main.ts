import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import { corsOptions, testCorsOptions } from './config/cors.config';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    /**
     *  NestJS мог работать поверх Express.js, обеспечивая
     *  дополнительные возможности и абстракции на основе
     *  этого популярного фреймворка Node.js.
     */
    new ExpressAdapter(),
  );

  if (process.env.NODE_ENV === 'production') {
    app.enableCors(corsOptions);
  } else {
    app.enableCors(testCorsOptions);
  }
  app.setGlobalPrefix('v1');
  /**
   * проверять все входящие запросы на соответствие
   * определенным критериям валидации, которые
   * вы устанавливаете в своих DTO.
   */
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(5050);
}
bootstrap();
