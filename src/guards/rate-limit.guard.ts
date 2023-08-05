// import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
// import { RateLimiterService, RateLimiterRes } from '@nestjs/rate-limiter';
//
// @Injectable()
// export class RateLimiterGuard extends ThrottlerGuard implements CanActivate {
//   constructor(
//     private readonly reflector: Reflector,
//     private readonly rateLimiterService: RateLimiterService,
//   ) {
//     super(reflector);
//   }
//
//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const req = context.switchToHttp().getRequest();
//
//     // Get the dynamic properties from the chatbot
//     // This is a placeholder, replace it with your own logic
//     const chatProps = this.getChatProps();
//
//     try {
//       await this.rateLimiterService.consume(req.ip, chatProps.limit);
//     } catch (error) {
//       throw new ThrottlerException('Too many requests');
//     }
//
//     return super.canActivate(context);
//   }
//
//   getChatProps(): { limit: number } {
//     // Fetch dynamic rate limit from chatbot properties
//     // Replace this with your own logic
//     return { limit: 20 };
//   }
// }
