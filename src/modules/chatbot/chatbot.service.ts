import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user/user.schema';
import { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ChatbotCreateDto } from './dto/chatbot-create.dto';
import { Chatbot, ChatbotDocument } from './chatbot.schema';
import { FileUpload } from '../fileUpload/fileUpload.schema';
import { ChatbotSources } from './schemas/chatbotSources.schema';
import { ChatbotSettingsService } from './chatbotSettings.service';
import { ChatbotSourcesService } from './chatbotSources.service';
import { CategoryEnum } from '../../enum/category.enum';

@Injectable()
export class ChatbotService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Chatbot.name) private chatbotModel: Model<Chatbot>,
    @InjectModel(ChatbotSources.name)
    private chatbotSourcesModel: Model<ChatbotSources>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private chatbotSettingsService: ChatbotSettingsService,
    private chatbotSourcesService: ChatbotSourcesService,
  ) {}

  async createDefault(payload: ChatbotCreateDto): Promise<ChatbotDocument> {
    const { owner } = payload;
    const userInstance = await this.userModel.findById(owner);

    if (!userInstance) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const newChatbot = new this.chatbotModel({
      owner: userInstance,
      // sources: sources_id,
      //settings: setting_id,
    });
    newChatbot.settings = await this.chatbotSettingsService.createDefault(
      newChatbot._id.toString(),
    );
    newChatbot.sources = await this.chatbotSourcesService.createDefault(
      newChatbot._id.toString(),
    );

    return await newChatbot.save();
  }

  async findById(id: string) {
    return this.chatbotModel.findById(id).populate('owner sources settings');
  }

  async findByUser(user_id: string) {
    return this.chatbotModel
      .find({
        owner: user_id,
      })
      .populate('owner sources settings');
  }
}
