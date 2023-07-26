import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ChatbotSettings } from './schemas/chatbotSettings.schema';
import { Model } from 'mongoose';
import {
  ChatbotSources,
  ChatbotSourcesDocument,
} from './schemas/chatbotSources.schema';
import { ObjectId } from 'typeorm';
import { Chatbot, ChatbotDocument } from './chatbot.schema';
import {
  FileUpload,
  FileUploadDocument,
} from '../fileUpload/fileUpload.schema';
import { CategoryEnum } from '../../enum/category.enum';

@Injectable()
export class ChatbotSourcesService {
  constructor(
    @InjectModel(ChatbotSources.name)
    private chatbotSourcesModel: Model<ChatbotSources>,
    @InjectModel(Chatbot.name) private chatbotModel: Model<Chatbot>,
  ) {}

  async createDefault(chatbot_id: string): Promise<ChatbotSourcesDocument> {
    const newSettings = new this.chatbotSourcesModel({
      chatbot_id,
    });
    return newSettings.save();
  }

  async addSourceFile(
    chatbot_id: string,
    newFile: FileUploadDocument,
    category: CategoryEnum.FILE | CategoryEnum.WEB,
  ) {
    const chatbot = await this.chatbotModel
      .findById(chatbot_id)
      .populate('sources')
      .exec();
    if (!chatbot) {
      throw new HttpException('Chatbot not found', HttpStatus.NOT_FOUND);
    }
    const sources = await this.chatbotSourcesModel.findById(
      chatbot.sources._id,
    );
    sources[category].push(newFile);

    return await sources.save();
  }

  async findByChatbotId(id: string): Promise<ChatbotSourcesDocument> {
    const sources = this.chatbotSourcesModel.findOne({
      chatbot_id: id,
    });
    if (!sources) {
      throw new HttpException('Settings not found', HttpStatus.NOT_FOUND);
    }
    return sources;
  }
}
