import { Injectable } from '@nestjs/common';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';

@Injectable()
export class RateLimitService {
  private readonly rateLimiter: RateLimiterRedis;

  constructor() {
    const redisClient = new Redis({
      // Fill in your Redis connection options here
    });

    this.rateLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: 'middleware',
      points: 10, // initial limit
      duration: 60, // duration in seconds before consumed points are reset
    });
  }

  async consume(key: string, newPoints: number, newDuration: number) {
    // Create new rate limiter with updated points and duration
    const rateLimiter = new RateLimiterRedis({
      storeClient: this.rateLimiter.storeClient,
      keyPrefix: this.rateLimiter.keyPrefix,
      points: newPoints,
      duration: newDuration,
    });

    // Try to consume points
    try {
      await rateLimiter.consume(key);
    } catch (rateLimiterRes) {
      // Not enough points to consume
      throw new Error('Too many requests');
    }
  }
}
