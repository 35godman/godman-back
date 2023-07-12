import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotSettingsService } from './chatbotSettings.service';
import { ChatbotSourcesService } from './chatbotSources.service';
import { CreateChatbotInstanceDto } from './dto/instance-create.dto';
import { ValidateObjectIdPipe } from '../../decorators/validateObjectIdPipe.decorator';

@Controller('chatbot')
export class ChatbotController {
  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly chatbotSettingsService: ChatbotSettingsService,
    private readonly chatbotSourcesService: ChatbotSourcesService,
  ) {}

  @Post('create')
  async createChatInstance(
    @Body() createChatInstance: CreateChatbotInstanceDto,
  ) {
    const { sources, user_id } = createChatInstance;
    const chatbot = await this.chatbotService.create({
      owner: user_id,
    });
    chatbot.sources = await this.chatbotSourcesService.create(
      sources,
      chatbot._id,
    );
    await chatbot.save();
    return chatbot;
  }

  @Post('settings-update')
  async updateSettingsChatbot(@Body() payload) {
    const { settings, chatbot_id } = payload;
    const settingInstance = await this.chatbotSettingsService.create(settings);
    const currentChatbot = await this.chatbotService.findById(chatbot_id);
    if (!currentChatbot || !chatbot_id) {
      throw new HttpException('Chatbot not found', HttpStatus.NOT_FOUND);
    }
    currentChatbot.settings = settingInstance;
    await currentChatbot.save();
  }

  @Get('find/:id')
  async findChatbotById(@Param('id', new ValidateObjectIdPipe()) id: string) {
    return this.chatbotService.findById(id);
  }

  @Get('find/user/:id')
  async findChatbotByUserId(
    @Param('id', new ValidateObjectIdPipe()) id: string,
  ) {
    return this.chatbotService.findByUser(id);
  }
}
