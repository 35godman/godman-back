import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

  async createDefault(chatbot_id: string) {
    const newSettings = new this.chatbotSettingsModel({
      chatbot_id: chatbot_id,
    });
    return await newSettings.save();
  }

  async updateSettings(
    settings_id: string,

    chatbot_settings: Partial<ChatbotSettingsDocument>,
  ) {
    const objToUpdate = {
      ...chatbot_settings,
    };
    const updatedSettings = await this.chatbotSettingsModel
      .findByIdAndUpdate(
        settings_id,
        { $set: chatbot_settings },
        { new: true, runValidators: true },
      )
      .exec();
    console.log(
      '=>(chatbotSettings.service.ts:35) chatbot_settings',
      updatedSettings,
    );
    console.log(
      '=>(chatbotSettings.service.ts:34) updatedSettings',
      settings_id,
    );
    if (!updatedSettings) {
      throw new HttpException('Settings not found', HttpStatus.NOT_FOUND);
    }

    return updatedSettings;
  }
}
