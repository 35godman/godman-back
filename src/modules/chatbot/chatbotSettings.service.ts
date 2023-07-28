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
    if (!updatedSettings) {
      throw new HttpException('Settings not found', HttpStatus.NOT_FOUND);
    }

    return updatedSettings;
  }

  async deleteById(id: string) {
    await this.chatbotSettingsModel.deleteOne({ _id: id }).exec();
  }

  async findByChatbotId(chatbot_id: string) {
    const settingsEntity = await this.chatbotSettingsModel.findOne({
      chatbot_id,
    });
    console.log(
      '=>(chatbotSettings.service.ts:53) settingsEntity',
      settingsEntity,
    );
    if (!settingsEntity) {
      throw new HttpException('Settings not found', HttpStatus.NOT_FOUND);
    }
    return settingsEntity;
  }

  validateNumChars(settingsEntity: ChatbotSettingsDocument, char_num: number) {
    if (
      settingsEntity.num_of_characters + char_num >
      settingsEntity.char_limit
    ) {
      throw new HttpException('Limit exceeded', HttpStatus.BAD_REQUEST);
    }
  }

  async increaseCharNum(chatbot_id: string, char_num: number) {
    const settingsEntity = await this.findByChatbotId(chatbot_id);
    this.validateNumChars(settingsEntity, char_num);
    settingsEntity.num_of_characters += char_num;
    await settingsEntity.save();
  }

  async decreaseCharNum(chatbot_id: string, char_num: number) {
    const settingsEntity = await this.findByChatbotId(chatbot_id);
    settingsEntity.num_of_characters -= char_num;
    if (settingsEntity.num_of_characters < 0) {
      settingsEntity.num_of_characters = 0;
    }
    await settingsEntity.save();
  }
}
