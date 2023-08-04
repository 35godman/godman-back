import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user/user.schema';
import { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ChatbotCreateDto } from './dto/chatbot-create.dto';
import { Chatbot, ChatbotDocument } from './schemas/chatbot.schema';
import { FileUpload } from '../FILES/fileUpload/fileUpload.schema';
import { ChatbotSources } from './schemas/chatbotSources.schema';
import { ChatbotSettingsService } from './chatbotSettings.service';
import { ChatbotSourcesService } from './chatbotSources.service';
import { CategoryEnum } from '../../enum/category.enum';
import { ResponseResult } from '../../enum/response.enum';
import { generateIframeUtil } from '../../utils/generateScripts/generateIframe.util';
import { generateScriptUtil } from '../../utils/generateScripts/generateScript.util';
import { obfuscatorUtil } from '../../utils/obfuscate/obfuscator.util';
import * as fs from 'fs';
import * as path from 'path';
import { PineconeService } from '../pinecone/pinecone.service';

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
    private pineconeService: PineconeService,
  ) {}

  async createDefault(payload: ChatbotCreateDto): Promise<ChatbotDocument> {
    const { owner } = payload;
    const userInstance = await this.userModel.findById(owner);

    if (!userInstance) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const newChatbot = new this.chatbotModel({
      owner: userInstance,
    });
    newChatbot.settings = await this.chatbotSettingsService.createDefault(
      newChatbot._id.toString(),
    );
    newChatbot.sources = await this.chatbotSourcesService.createDefault(
      newChatbot._id.toString(),
    );

    return await newChatbot.save();
  }

  async findById(id: string): Promise<ChatbotDocument> {
    const chatbot = await this.chatbotModel
      .findById(id)
      .populate('sources settings');
    if (!chatbot) {
      throw new HttpException('Chatbot not found', HttpStatus.NOT_FOUND);
    }
    return chatbot;
  }

  async findByUser(user_id: string) {
    return this.chatbotModel
      .find({
        owner: user_id,
      })
      .populate('owner sources settings');
  }

  async delete(id: string) {
    const chatbot = await this.findById(id);
    const settings_id = chatbot.settings._id.toString();
    const sources_id = chatbot.sources._id.toString();
    await this.chatbotSourcesService.deleteAllSources(chatbot._id.toString());
    await this.chatbotSettingsService.deleteById(settings_id);
    await this.chatbotSourcesService.deleteById(sources_id);
    await this.chatbotModel.deleteOne({ _id: id }).exec();
    await this.pineconeService.deleteNamespace(chatbot._id.toString());
    return ResponseResult.SUCCESS;
  }

  async generateIframeCode(chatbot_id: string) {
    const chatbotEntity = await this.findById(chatbot_id);
    console.log(process.cwd(), '/src/utils/generateScripts/iframe.js');
    const scriptEmbed = fs.readFileSync(
      path.join(process.cwd(), '/src/utils/generateScripts/iframe.js'),
    );

    obfuscatorUtil(scriptEmbed.toString());
    chatbotEntity.embed_code.script = generateScriptUtil();
    chatbotEntity.embed_code.iframe = generateIframeUtil(chatbot_id);

    const settingEntity = await this.chatbotSettingsService.findByChatbotId(
      chatbot_id,
    );
    settingEntity.visibility = 'public';

    await settingEntity.save();
    await chatbotEntity.save();
  }
}
