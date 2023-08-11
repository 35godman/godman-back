import { Body, Controller, Post, Query, Res, UseGuards } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { EmbeddingSetupDto } from './dto/setup-pinecone.dto';
import { AskChatDto } from './dto/ask-chat.dto';
import { AuthJWTGuard } from '../../guards/auth.guard';
import { ChatbotOwnerGuard } from '../../guards/chatbot-owner.guard';
import { RateLimitGuard } from '../../guards/rate-limit.guard';
import { ChatbotDomainGuard } from '../../guards/chatbot-domain.guard';

@Controller('embedding')
export class EmbeddingController {
  constructor(private embeddingService: EmbeddingService) {}

  @UseGuards(AuthJWTGuard, ChatbotOwnerGuard)
  @Post('/setup')
  async setupPinecone(@Query('chatbot_id') chatbot_id: string) {
    return await this.embeddingService.setup(chatbot_id);
  }

  @UseGuards(RateLimitGuard)
  @Post('/ask')
  async askChatbot(@Body() askChatDto: AskChatDto, @Res() response) {
    await this.embeddingService.askChat(askChatDto, response);
  }
}
