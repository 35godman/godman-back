import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ChatbotSettings } from './schemas/chatbotSettings.schema';
import { Model } from 'mongoose';
import {
  ChatbotSources,
  ChatbotSourcesDocument,
} from './schemas/chatbotSources.schema';
import { ObjectId } from 'typeorm';
import { ChatbotDocument } from './chatbot.schema';

@Injectable()
export class ChatbotSourcesService {
  constructor(
    @InjectModel(ChatbotSources.name)
    private chatbotSourcesModel: Model<ChatbotSources>,
  ) {}

  async createDefault(chatbot_id: string): Promise<ChatbotSourcesDocument> {
    const newSettings = new this.chatbotSourcesModel({
      chatbot_id,
    });
    return newSettings.save();
  }
}
