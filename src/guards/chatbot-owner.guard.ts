import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ChatbotService } from '../modules/chatbot/chatbot.service';
import { UserService } from '../modules/user/user.service';

@Injectable()
export class ChatbotOwnerGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private chatbotService: ChatbotService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user } = request;
    const { chatbot_id } = request.body;
    const chatbot = await this.chatbotService.findById(chatbot_id);
    return chatbot.owner._id.toString() === user.user_id;
  }
}
