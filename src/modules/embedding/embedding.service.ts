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

@Injectable()
export class EmbeddingService {
  private client: PineconeClient;
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private yandexCloudService: YandexCloudService,
  ) {}

  async setup({ user_id }) {
    this.client = await createPineconeClient();
    await this.yandexCloudService.downloadFiles(user_id);
    const loader = new DirectoryLoader(`./docs/test`, {
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
    await updatePinecone(this.client, indexName, docs);
  }

  async createEmbeddingOpenAi(payload: EmbeddingCreateOpenAIDto) {
    const { question, user_id, chatbot } = payload;
    const currentUser = await this.userModel.findById(user_id);
    if (!currentUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const chatbot = await this.ch;
    await queryPineconeVectorStoreAndQueryLLM(
      this.client,
      indexName,
      question,
      currentUser,
      chatbot,
    );
  }
}
