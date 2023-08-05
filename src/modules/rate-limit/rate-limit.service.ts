import { Inject, Injectable } from '@nestjs/common';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { Redis } from 'ioredis';

@Injectable()
export class RateLimitService {
  constructor(
    @Inject('REDIS_CONNECTION') private readonly redisClient: Redis,
  ) {}

  async consume(key: string, newPoints: number, newDuration: number) {
    console.log('=>(rate-limit.service.ts:12) newDuration', newDuration);
    console.log('=>(rate-limit.service.ts:12) newPoints', newPoints);
    console.log('=>(rate-limit.service.ts:12) key', key);
    // Create new rate limiter with updated points and duration
    const rateLimiter = new RateLimiterRedis({
      storeClient: this.redisClient,
      keyPrefix: 'rate_limiter:',
      points: newPoints,
      duration: newDuration,
    });

    // Try to consume points
    try {
      await rateLimiter.consume(key);
    } catch (rateLimiterRes) {
      // Not enough points to consume
      throw new Error();
    }
  }
}
