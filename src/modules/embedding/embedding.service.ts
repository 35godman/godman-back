import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PineconeClient } from '@pinecone-database/pinecone';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { DocxLoader } from 'langchain/document_loaders/fs/docx';
import { updatePinecone } from '../../utils/embeddings/updatePinecone';
import { indexName } from '../../utils/embeddings/config';
import { createPineconeClient } from '../../config/pinecone.config';
import { queryPineconeVectorStoreAndQueryLLM } from '../../utils/embeddings/queryPineconeVectorStoreAndQueryLLM';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user/user.schema';
import { Model } from 'mongoose';
import { YandexCloudService } from '../FILES/yandexCloud/yandexCloud.service';
import { AskChatDto } from './dto/ask-chat.dto';
import { Chatbot } from '../chatbot/schemas/chatbot.schema';
import { ChatbotService } from '../chatbot/chatbot.service';
import { FileUploadService } from '../FILES/fileUpload/fileUpload.service';
import { ResponseResult } from '../../enum/response.enum';
import { Response } from 'express';
import { ConversationService } from '../conversation/conversation.service';
@Injectable()
export class EmbeddingService {
  private client: PineconeClient;
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Chatbot.name) private chatbotModel: Model<Chatbot>,
    private chatbotService: ChatbotService,
    private yandexCloudService: YandexCloudService,
    private fileUploadService: FileUploadService,
    private conversationService: ConversationService,
  ) {}

  async setup(chatbot_id: string) {
    this.client = await createPineconeClient();
    await this.yandexCloudService.downloadFiles(chatbot_id);

    const loader = new DirectoryLoader(`./docs/${chatbot_id}`, {
      '.txt': (path) => new TextLoader(path),
      '.md': (path) => new TextLoader(path),
      '.pdf': (path) => new PDFLoader(path),
      '.docx': (path) => new DocxLoader(path),
    });

    const docs = await loader.load();

    // we only have 1 index that's why this function is not needed for now
    /** @description
     * const vectorDimensions = 1536;
     * console.log(`creating pinecone index ${indexName}`);
     * await createPineconeIndex(client, indexName, vectorDimensions);
     */
    await updatePinecone(this.client, indexName, docs, chatbot_id);
    await this.fileUploadService.deleteChatbotDirectory(chatbot_id);
    return ResponseResult.SUCCESS;
  }

  async askChat(payload: AskChatDto, response: Response): Promise<void> {
    const { question, chatbot_id, conversation_id, messages } = payload;
    this.client = await createPineconeClient();
    const chatbotInstance = await this.chatbotService.findById(chatbot_id);
    if (!chatbotInstance) {
      throw new HttpException(
        'Chatbot instance not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const conversationData = await queryPineconeVectorStoreAndQueryLLM(
      this.client,
      indexName,
      question,
      chatbotInstance,
      response,
      conversation_id,
      messages,
    );
    await this.conversationService.addMessage(conversationData);
  }
}
