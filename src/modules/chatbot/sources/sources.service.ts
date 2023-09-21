import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ChatbotSettings } from '../schemas/chatbotSettings.schema';
import { Model } from 'mongoose';
import {
  ChatbotSources,
  ChatbotSourcesDocument,
} from '../schemas/chatbotSources.schema';
import { ObjectId } from 'typeorm';
import { Chatbot, ChatbotDocument } from '../schemas/chatbot.schema';
import {
  FileUpload,
  FileUploadDocument,
} from '../../FILES/fileUpload/fileUpload.schema';
import { CategoryEnum } from '../../../enum/category.enum';
import { ResponseResult } from '../../../enum/response.enum';
import { UpdateQnADto } from '../../FILES/fileUpload/dto/add-qna.dto';
import { SettingsService } from '../settings/settings.service';
import { YandexCloudService } from '../../FILES/yandexCloud/yandexCloud.service';
import { ChatbotService } from '../chatbot.service';
import { FileUploadService } from '../../FILES/fileUpload/fileUpload.service';
import * as pMap from 'p-map';
@Injectable()
export class SourcesService {
  constructor(
    @InjectModel(ChatbotSources.name)
    private chatbotSourcesModel: Model<ChatbotSources>,
    @InjectModel(Chatbot.name) private chatbotModel: Model<Chatbot>,
    private chatbotSettingsService: SettingsService,
    private yandexCloudService: YandexCloudService,
    @Inject(forwardRef(() => FileUploadService))
    private fileUploadService: FileUploadService,
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

    const result = await this.yandexCloudService.uploadFile(
      chatbot_id,
      process.env.QNA_DATASOURCE_NAME,
      fileData,
    );
    return result.$metadata.httpStatusCode;
  }
  async resetWebCrawledFiles(chatbot_id: string) {
    const sources = await this.findByChatbotId(chatbot_id);
    const web_sources = sources.website;

    // Define the mapper function that will be executed concurrently
    const mapper = async (web_source) => {
      return this.fileUploadService.removeCrawledFileFromYandexCloud(
        {
          web_link: web_source.originalName,
          weblink_id: web_source._id.toString(),
        },
        chatbot_id,
      );
    };

    // Use p-map to handle the deletion with concurrency limit
    await pMap(web_sources, mapper, {
      concurrency: 20,
    });

    // Reset sources if needed
    // sources.website = [];
    await sources.save();
  }

  async resetUploadedFiles(chatbot_id: string) {
    const sources = await this.findByChatbotId(chatbot_id);
    const files = sources.files;
    for (const file of files) {
      await this.yandexCloudService.removeUploadedFile(
        chatbot_id,
        file.originalName,
      );
    }
    sources.files = [];
    await sources.save();
    return ResponseResult.SUCCESS;
  }

  async resetQnA(chatbot_id: string) {
    const sources = await this.findByChatbotId(chatbot_id);
    const qna = sources.QA_list;
    await this.yandexCloudService.removeUploadedFile(
      chatbot_id,
      process.env.QNA_DATASOURCE_NAME,
    );
    sources.QA_list = [];
    await sources.save();
    return ResponseResult.SUCCESS;
  }

  async resetTextSource(chatbot_id: string) {
    const sources = await this.findByChatbotId(chatbot_id);
    await this.yandexCloudService.removeUploadedFile(
      chatbot_id,
      process.env.TEXT_DATASOURCE_NAME,
    );
    sources.text = '';
    await sources.save();
    return ResponseResult.SUCCESS;
  }

  async deleteAllSources(chatbot_id: string) {
    await this.resetWebCrawledFiles(chatbot_id);
    await this.resetUploadedFiles(chatbot_id);
    await this.resetTextSource(chatbot_id);
    await this.resetQnA(chatbot_id);
    return ResponseResult.SUCCESS;
  }
}
