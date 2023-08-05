import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RateLimitService } from '../modules/rate-limit/rate-limit.service';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rateLimitService: RateLimitService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    // Get the dynamic properties from the chatbot
    const chatProps = this.getChatProps();

    try {
      await this.rateLimitService.consume(
        req.ip,
        chatProps.points,
        chatProps.duration,
      );
    } catch (error) {
      throw new Error('Too many requests');
    }

    return true;
  }

  getChatProps(): { points: number; duration: number } {
    // Fetch dynamic rate limit from chatbot properties
    // Replace this with your own logic
    return { points: 20, duration: 60 };
  }
}
