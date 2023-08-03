import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { AuthJWTGuard } from '../../guards/auth.guard';
import { ChatbotOwnerGuard } from '../../guards/chatbot-owner.guard';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  //async addConversation(@Query('chatbot_id') chatbot_id: string) {}

  @UseGuards(AuthJWTGuard, ChatbotOwnerGuard)
  @Get('show-latest-source')
  async getLatestSource(@Query('conversation_id') conversation_id: string) {
    return await this.conversationService.showLatestSource(conversation_id);
  }
}
