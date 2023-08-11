import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { SettingsService } from './settings/settings.service';
import { SourcesService } from './sources/sources.service';
import { CreateChatbotInstanceDto } from './dto/instance-create.dto';
import { ValidateObjectIdPipe } from '../../decorators/validateObjectIdPipe.decorator';
import { AuthJWTGuard } from '../../guards/auth.guard';
import { ChatbotOwnerGuard } from '../../guards/chatbot-owner.guard';
import { Chatbot } from './schemas/chatbot.schema';
import { CreateDefaultChatbotDto } from './dto/create-default.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { ResponseResult } from '../../enum/response.enum';
import { AddQnaDto } from '../FILES/fileUpload/dto/add-qna.dto';
import { ChatbotDomainGuard } from '../../guards/chatbot-domain.guard';

@Controller('chatbot')
export class ChatbotController {
  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly chatbotSettingsService: SettingsService,
    private readonly chatbotSourcesService: SourcesService,
  ) {}

  @UseGuards(AuthJWTGuard)
  @Post('create-default')
  async createDefaultChatbot(
    @Body() createDefaultChatbot: CreateDefaultChatbotDto,
  ): Promise<Chatbot> {
    const { user_id } = createDefaultChatbot;
    return await this.chatbotService.createDefault({
      owner: user_id,
    });
  }

  @UseGuards(AuthJWTGuard, ChatbotOwnerGuard)
  @Post('settings-update')
  async updateSettingsChatbot(
    @Query('chatbot_id') chatbot_id: string,
    @Body() payload: UpdateSettingsDto,
  ) {
    const { chatbot_settings, chatbot_name } = payload;
    const currentChatbot = await this.chatbotService.findById(chatbot_id);
    if (!currentChatbot) {
      throw new HttpException('Chatbot not found', HttpStatus.NOT_FOUND);
    }
    currentChatbot.chatbot_name = chatbot_name;
    await currentChatbot.save();

    await this.chatbotSettingsService.updateSettings(
      currentChatbot.settings._id.toString(),
      chatbot_settings,
    );
    return ResponseResult.SUCCESS;
  }

  @UseGuards(AuthJWTGuard, ChatbotOwnerGuard)
  @Get('find')
  async findChatbotById(
    @Query('chatbot_id', new ValidateObjectIdPipe()) id: string,
  ) {
    return this.chatbotService.findById(id);
  }

  @UseGuards(AuthJWTGuard)
  @Get('find/user/:id')
  async findChatbotByUserId(
    @Param('id', new ValidateObjectIdPipe()) id: string,
  ) {
    return this.chatbotService.findByUser(id);
  }

  @UseGuards(AuthJWTGuard, ChatbotOwnerGuard)
  @Delete('delete')
  async deleteChatbotById(@Query('chatbot_id') id: string) {
    return this.chatbotService.delete(id);
  }

  @UseGuards(AuthJWTGuard, ChatbotOwnerGuard)
  @Post('generate-iframe')
  async generateIframe(@Query('chatbot_id') chatbot_id: string) {
    await this.chatbotService.generateIframeCode(chatbot_id);
    return ResponseResult.SUCCESS;
  }

  @UseGuards(AuthJWTGuard, ChatbotOwnerGuard)
  @Post('reset-websources')
  async resetWebsources(@Query('chatbot_id') chatbot_id: string) {
    await this.chatbotSourcesService.resetWebCrawledFiles(chatbot_id);
    return ResponseResult.SUCCESS;
  }

  @UseGuards(AuthJWTGuard, ChatbotOwnerGuard)
  @Post('reset-all-sources')
  async resetAllSources(@Query('chatbot_id') chatbot_id) {
    await this.chatbotSourcesService.deleteAllSources(chatbot_id);
    return ResponseResult.SUCCESS;
  }

  @Get('iframe')
  async getIframe(@Query('chatbot_id') chatbot_id) {
    return await this.chatbotService.getChatbotForIframe(chatbot_id);
  }
}
