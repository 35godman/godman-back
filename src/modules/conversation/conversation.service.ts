import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatbotService } from '../chatbot/chatbot.service';
import { Conversation } from './conversation.schema';
import { AddMessageDto } from './dto/add-message.dto';
import { ResponseResult } from '../../enum/response.enum';

@Injectable()
export class ConversationService {
  constructor(
    private chatbotService: ChatbotService,
    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
  ) {}

  async addMessage(payload: AddMessageDto) {
    const {
      conversation_id,
      assistant_message,
      user_message,
      matched_vectors,
      chatbot_id,
    } = payload;
    const existingConversation = await this.findByConversationId(
      conversation_id,
    );
    /**
     * @COMMENT if conversation doesnt exist we create a new instance
     */
    if (!existingConversation) {
      const newConversation = await this.createDefault(chatbot_id);
      newConversation.messages = [
        {
          content: user_message,
          role: 'user',
        },
        {
          content: assistant_message,
          role: 'assistant',
          source: matched_vectors,
        },
      ];
      newConversation.conversation_id = conversation_id;
      await newConversation.save();
      return ResponseResult.SUCCESS;
    }
    const messages = existingConversation.messages;
    existingConversation.messages = [
      ...messages,
      {
        content: user_message,
        role: 'user',
      },
      {
        content: assistant_message,
        role: 'assistant',
        source: matched_vectors,
      },
    ];
    console.log(
      '=>(conversation.service.ts:60) existingConversation',
      existingConversation,
    );
    await existingConversation.save();
  }
  async findByConversationId(id: string) {
    return this.conversationModel.findOne({
      conversation_id: id,
    });
  }

  async createDefault(chatbot_id: string) {
    const newConversation = new this.conversationModel({
      chatbot_id: chatbot_id,
    });
    return newConversation.save();
  }

  async showLatestSource(conversation_id: string){
    const existingConversation = await this.findByConversationId(
      conversation_id,
    );
    if(!existingConversation){
      throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND)
    }
    return existingConversation.messages.pop()
  }
}
