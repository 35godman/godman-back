import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { EmbeddingService } from './embedding.service';
import { EmbeddingSetupDto } from './dto/setup-pinecone.dto';

@Controller('embedding')
export class EmbeddingController {
  constructor(private embeddingService: EmbeddingService) {}

  @Post('/setup')
  setupPinecone(@Body() setupPinecone: EmbeddingSetupDto) {
    return this.embeddingService.setup(setupPinecone);
  }
}
