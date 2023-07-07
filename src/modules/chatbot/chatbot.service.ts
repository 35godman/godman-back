import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user/user.schema';
import { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ChatbotCreateDto } from './dto/create.dto';
import { ResponseResult } from '../../enum/response.enum';
import { Chatbot } from './chatbot.schema';

@Injectable()
export class ChatbotService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Chatbot.name) private chatbotModel: Model<Chatbot>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async create(payload: ChatbotCreateDto): Promise<ResponseResult> {
    const { owner, visibility } = payload;

    const newChatbot = new this.chatbotModel({
      owner,
      visibility,
    });
    await newChatbot.save();
    return ResponseResult.SUCCESS;
  }
  //getbyuser

  //by id
}
