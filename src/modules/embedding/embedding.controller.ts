import { Body, Controller, Post, Res } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { EmbeddingSetupDto } from './dto/setup-pinecone.dto';
import { AskChatDto } from './dto/ask-chat.dto';

@Controller('embedding')
export class EmbeddingController {
  constructor(private embeddingService: EmbeddingService) {}

  @Post('/setup')
  async setupPinecone(@Body() setupPinecone: EmbeddingSetupDto) {
    return await this.embeddingService.setup(setupPinecone);
  }

  @Post('/ask')
  async askChatbot(@Body() askChatDto: AskChatDto, @Res() response) {
    await this.embeddingService.askChat(askChatDto, response);
  }
}
