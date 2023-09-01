import { Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { AuthJWTGuard } from '../../guards/auth.guard';
import { ChatbotOwnerGuard } from '../../guards/chatbot-owner.guard';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @UseGuards(AuthJWTGuard, ChatbotOwnerGuard)
  @Get('show-latest-source')
  async getLatestSource(@Query('conversation_id') conversation_id: string) {
    return await this.conversationService.showLatestSource(conversation_id);
  }

  // @UseGuards(AuthJWTGuard)
  @Get('export')
  async exportConversations(
    @Query('chatbot_id') chatbot_id: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Res() res,
  ) {
    const pdfBuffer = await this.conversationService.exportConversations(
      chatbot_id,
      from,
      to,
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${chatbot_id}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length.toString());
    res.send(pdfBuffer);
  }
}
