import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user/user.schema';
import { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ChatbotCreateDto } from './dto/chatbot-create.dto';
import { ResponseResult } from '../../enum/response.enum';
import { Chatbot, ChatbotDocument } from './chatbot.schema';

@Injectable()
export class ChatbotService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Chatbot.name) private chatbotModel: Model<Chatbot>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async create(payload: ChatbotCreateDto): Promise<ChatbotDocument> {
    const { owner } = payload;
    const userInstance = await this.userModel.findById(owner);
    const newChatbot = new this.chatbotModel({
      owner: userInstance,
      // sources: sources_id,
      //settings: setting_id,
    });

    return await newChatbot.save();
  }
  //getbyuser

  //by id
  async findById(id: string) {
    return this.chatbotModel.findById(id).populate('owner sources settings');
  }

  async findByUser(user_id: string) {
    return this.chatbotModel.find({
      owner: user_id,
    });
  }
}
