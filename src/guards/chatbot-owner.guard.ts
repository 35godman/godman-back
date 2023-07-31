import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
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
    const { chatbot_id } = request.query;
    const chatbot = await this.chatbotService.findById(chatbot_id);
    if (!chatbot) {
      throw new HttpException('Chatbot not found', HttpStatus.NOT_FOUND);
    }
    request.chatbot = chatbot;
    return chatbot.owner._id.toString() === user.user_id;
  }
}
