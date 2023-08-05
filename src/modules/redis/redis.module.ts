import { Module } from '@nestjs/common';
import Redis from 'ioredis';

@Module({
  providers: [
    {
      provide: 'REDIS_CONNECTION',
      useFactory: () =>
        new Redis({
          host: 'localhost', // replace with your Redis server's hostname
          port: 6379, // replace with your Redis server's port
        }),
    },
  ],
  exports: ['REDIS_CONNECTION'],
})
export class RedisModule {}
