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
import { async } from 'rxjs';
import { ResponseResult } from '../../enum/response.enum';
import { UpdateQnADto } from '../fileUpload/dto/add-qna.dto';
import { ChatbotSettingsService } from './chatbotSettings.service';
import { YandexCloudService } from '../yandexCloud/yandexCloud.service';

@Injectable()
export class ChatbotSourcesService {
  constructor(
    @InjectModel(ChatbotSources.name)
    private chatbotSourcesModel: Model<ChatbotSources>,
    @InjectModel(Chatbot.name) private chatbotModel: Model<Chatbot>,
    private chatbotSettingsService: ChatbotSettingsService,
    private yandexCloudService: YandexCloudService,
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
  ): Promise<FileUploadDocument> {
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

    await sources.save();

    return newFile;
  }

  async findByChatbotId(id: string): Promise<ChatbotSourcesDocument> {
    const sources = await this.chatbotSourcesModel.findOne({
      chatbot_id: id,
    });
    if (!sources) {
      throw new HttpException('Settings not found', HttpStatus.NOT_FOUND);
    }
    return sources;
  }

  async deleteById(id: string) {
    await this.chatbotSourcesModel.deleteOne({ _id: id }).exec();
    return ResponseResult.SUCCESS;
  }

  async addQnA(payload: UpdateQnADto) {
    const { char_length, chatbot_id, data } = payload;

    const sources = await this.findByChatbotId(chatbot_id);

    let prevQA_List = '';
    sources.QA_list.forEach((item) => {
      prevQA_List += item.answer;
      prevQA_List += item.question;
    });
    await this.chatbotSettingsService.increaseCharNum(
      chatbot_id,
      char_length - prevQA_List.length,
    );

    sources.QA_list = data;
    await sources.save();

    /**
     * @COMMENT(convert array to json)
     */
    const fileData = JSON.stringify(data, null, 2);

    return await this.yandexCloudService.uploadFile(
      chatbot_id,
      process.env.QNA_DATASOURCE_NAME,
      fileData,
    );
  }
}
