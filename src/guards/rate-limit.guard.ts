import {
  ThrottlerGuard,
  ThrottlerModuleOptions,
  ThrottlerStorage,
} from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import {
  Injectable,
  ExecutionContext,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RateLimitService } from '../modules/rate-limit/rate-limit.service';
import { ChatbotService } from '../modules/chatbot/chatbot.service';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  constructor(
    options: ThrottlerModuleOptions,
    storageService: ThrottlerStorage,
    reflector: Reflector,
    private readonly rateLimitService: RateLimitService,
    private readonly chatbotService: ChatbotService,
  ) {
    super(options, storageService, reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isThrottlerGuardActive = await super.canActivate(context);
    if (!isThrottlerGuardActive) return false;

    const req = context.switchToHttp().getRequest();
    const { chatbot_id } = req.query;
    // Get the dynamic properties from the chatbot
    const { points, duration, endLimitMessage } = await this.getChatProps(
      chatbot_id,
    );

    try {
      await this.rateLimitService.consume(chatbot_id, points, duration);
    } catch (error) {
      throw new HttpException(endLimitMessage, HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }

  async getChatProps(
    chatbot_id: string,
  ): Promise<{ points: number; duration: number; endLimitMessage: string }> {
    const chatbot = await this.chatbotService.findById(chatbot_id);
    const points = chatbot.settings.rate_limit.messages_limit;
    const duration = chatbot.settings.rate_limit.seconds;
    return {
      points,
      duration,
      endLimitMessage: chatbot.settings.rate_limit.limit_end_message,
    };
  }
}
