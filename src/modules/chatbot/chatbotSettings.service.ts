import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ChatbotSettings,
  ChatbotSettingsDocument,
} from './schemas/chatbotSettings.schema';

@Injectable()
export class ChatbotSettingsService {
  constructor(
    @InjectModel(ChatbotSettings.name)
    private chatbotSettingsModel: Model<ChatbotSettings>,
  ) {}

  async create(
    settingsData: Partial<ChatbotSettings>,
  ): Promise<ChatbotSettingsDocument> {
    const newSettings = new this.chatbotSettingsModel(settingsData);
    return newSettings.save();
  }
}
