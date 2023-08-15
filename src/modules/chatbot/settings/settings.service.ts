import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ChatbotSettings,
  ChatbotSettingsDocument,
} from '../schemas/chatbotSettings.schema';
import { ChatbotService } from '../chatbot.service';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(ChatbotSettings.name)
    private chatbotSettingsModel: Model<ChatbotSettings>,
    @Inject(forwardRef(() => ChatbotService))
    private chatbotService: ChatbotService,
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

  async getAllowedDomains(chatbot_id: string) {
    const chatbot = await this.chatbotService.findById(chatbot_id);
    return chatbot.settings.domains.map((item) => item.trim().toLowerCase());
  }
}
