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
import { ChatbotSettingsService } from './chatbotSettings.service';
import { ChatbotSourcesService } from './chatbotSources.service';
import { CreateChatbotInstanceDto } from './dto/instance-create.dto';
import { ValidateObjectIdPipe } from '../../decorators/validateObjectIdPipe.decorator';
import { AuthJWTGuard } from '../../guards/auth.guard';
import { ChatbotOwnerGuard } from '../../guards/chatbot-owner.guard';
import { Chatbot } from './chatbot.schema';
import { CreateDefaultChatbotDto } from './dto/create-default.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { ResponseResult } from '../../enum/response.enum';

@Controller('chatbot')
export class ChatbotController {
  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly chatbotSettingsService: ChatbotSettingsService,
    private readonly chatbotSourcesService: ChatbotSourcesService,
  ) {}

  @Post('create-default')
  async createDefaultChatbot(
    @Body() createDefaultChatbot: CreateDefaultChatbotDto,
  ): Promise<Chatbot> {
    const { user_id } = createDefaultChatbot;
    return await this.chatbotService.createDefault({
      owner: user_id,
    });
  }

  @UseGuards(AuthJWTGuard)
  @Post('settings-update')
  async updateSettingsChatbot(@Body() payload: UpdateSettingsDto) {
    const { chatbot, chatbot_id } = payload;
    const currentChatbot = await this.chatbotService.findById(chatbot_id);
    if (!currentChatbot) {
      throw new HttpException('Chatbot not found', HttpStatus.NOT_FOUND);
    }
    currentChatbot.chatbot_name = chatbot.chatbot_name;
    await currentChatbot.save();

    await this.chatbotSettingsService.updateSettings(
      currentChatbot.settings._id.toString(),
      chatbot.settings,
    );
    return ResponseResult.SUCCESS;
  }

  @UseGuards(AuthJWTGuard)
  @Get('find/:id')
  async findChatbotById(@Param('id', new ValidateObjectIdPipe()) id: string) {
    return this.chatbotService.findById(id);
  }

  @UseGuards(AuthJWTGuard)
  @Get('find/user/:id')
  async findChatbotByUserId(
    @Param('id', new ValidateObjectIdPipe()) id: string,
  ) {
    return this.chatbotService.findByUser(id);
  }

  @UseGuards(AuthJWTGuard)
  @Delete('delete')
  async deleteChatbotById(@Query('chatbot_id') id: string) {
    return this.chatbotService.delete(id);
  }
}
