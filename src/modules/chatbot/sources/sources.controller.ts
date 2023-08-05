import { Body, Controller, Post, Query, UseGuards } from '@nestjs/common';
import { AuthJWTGuard } from '../../../guards/auth.guard';
import { ChatbotOwnerGuard } from '../../../guards/chatbot-owner.guard';
import { AddQnaDto } from '../../FILES/fileUpload/dto/add-qna.dto';
import { SourcesService } from './sources.service';

@Controller('sources')
export class SourcesController {
  constructor(private readonly chatbotSourcesService: SourcesService) {}

  @UseGuards(AuthJWTGuard, ChatbotOwnerGuard)
  @Post('add-qna')
  async addQnaHandler(
    @Body() addQnaDto: AddQnaDto,
    @Query('chatbot_id') chatbot_id: string,
  ) {
    const { data } = addQnaDto;
    let text = '';
    data.forEach((item) => {
      text += item.answer;
      text += item.question;
    });
    return await this.chatbotSourcesService.addQnA({
      data,
      chatbot_id,
      char_length: text.length,
    });
  }
}
