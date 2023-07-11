import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ChatbotSettings } from './schemas/chatbotSettings.schema';
import { Model } from 'mongoose';
import {
  ChatbotSources,
  ChatbotSourcesDocument,
} from './schemas/chatbotSources.schema';
import { ObjectId } from 'typeorm';

@Injectable()
export class ChatbotSourcesService {
  constructor(
    @InjectModel(ChatbotSources.name)
    private chatbotSourcesModel: Model<ChatbotSources>,
  ) {}

  async create(
    settingsData: Partial<ChatbotSources>,
    chatbot_id: ObjectId,
  ): Promise<ChatbotSourcesDocument> {
    const newSettings = new this.chatbotSourcesModel({
      ...settingsData,
    });
    return newSettings.save();
  }
}
