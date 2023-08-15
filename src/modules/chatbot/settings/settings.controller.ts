import { Controller, Get, Query } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly chatbotSettingsService: SettingsService) {}
  @Get('allowed-domains')
  async getAllowedDomains(@Query('chatbot_id') chatbot_id) {
    return await this.chatbotSettingsService.getAllowedDomains(chatbot_id);
  }
}
