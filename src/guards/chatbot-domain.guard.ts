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
export class ChatbotDomainGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private chatbotService: ChatbotService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { chatbot_id } = request.query; // Adjust this based on how you identify the chatbot

    const chatbot = await this.chatbotService.findById(chatbot_id);
    const cspHeader = this.generateCSP(chatbot.settings.domains); // Generate CSP header
    console.log('=>(chatbot-domain.guard.ts:28) cspHeader', cspHeader);
    response.setHeader('Content-Security-Policy', cspHeader);

    return true;
  }
  private generateCSP(allowedDomains: string[]): string {
    const domains = allowedDomains.join(' ');
    return `frame-ancestors  ${domains};`; //add 'self' for localhost
  }

  isValidDomain(domain: string, domainsList: string[]): boolean {
    return domainsList.includes(domain);
  }
}
