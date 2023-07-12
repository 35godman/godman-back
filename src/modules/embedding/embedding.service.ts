import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PineconeClient } from '@pinecone-database/pinecone';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { DocxLoader } from 'langchain/document_loaders/fs/docx';
import { createPineconeIndex } from '../../utils/embeddings/createPineconeIndex';
import { updatePinecone } from '../../utils/embeddings/updatePinecone';
import { indexName } from '../../utils/embeddings/config';
import { createPineconeClient } from '../../config/pinecone.config';
import { encode } from 'gpt-3-encoder';
import { loadQAStuffChain } from 'langchain/chains';
import { OpenAI } from 'langchain/llms/openai';
import { EmbeddingCreateOpenAIDto } from './dto/create-openai.dto';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { queryPineconeVectorStoreAndQueryLLM } from '../../utils/embeddings/queryPineconeVectorStoreAndQueryLLM';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user/user.schema';
import { Model } from 'mongoose';
import { YandexCloudService } from '../yandexCloud/yandexCloud.service';
import { S3Loader } from 'langchain/document_loaders/web/s3';
import {
  awsConfig,
  BUCKET_NAME,
  yandexCloudClient,
} from '../../config/aws.config';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { AskChatDto } from './dto/ask-chat.dto';
import { Chatbot } from '../chatbot/chatbot.schema';
import { ChatbotService } from '../chatbot/chatbot.service';

@Injectable()
export class EmbeddingService {
  private client: PineconeClient;
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Chatbot.name) private chatbotModel: Model<Chatbot>,
    private chatbotService: ChatbotService,
    private yandexCloudService: YandexCloudService,
  ) {}

  async setup({ chatbot_id }) {
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
  }

  async askChat(payload: AskChatDto) {
    const { question, user_id, chatbot_id } = payload;
    this.client = await createPineconeClient();
    const chatbotInstance = await this.chatbotService.findById(chatbot_id);
    if (!chatbotInstance) {
      throw new HttpException(
        'Chatbot instance not found',
        HttpStatus.NOT_FOUND,
      );
    }
    await queryPineconeVectorStoreAndQueryLLM(
      this.client,
      indexName,
      question,
      chatbotInstance,
    );
  }
}
