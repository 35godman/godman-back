import { Controller, Query } from '@nestjs/common';

@Controller('conversation')
export class ConversationController {
  constructor() {}

  async addConversation(@Query('chatbot_id') chatbot_id: string) {}
}
