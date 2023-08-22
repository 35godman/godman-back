import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PineconeClient } from '@pinecone-database/pinecone';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { DocxLoader } from 'langchain/document_loaders/fs/docx';
import { indexName } from '../../utils/embeddings/config';
import { createPineconeClient } from '../../config/pinecone.config';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user/user.schema';
import { Model } from 'mongoose';
import { YandexCloudService } from '../FILES/yandexCloud/yandexCloud.service';
import { AskChatDto, ConversationEmbedding } from './dto/ask-chat.dto';
import { Chatbot, ChatbotDocument } from '../chatbot/schemas/chatbot.schema';
import { ChatbotService } from '../chatbot/chatbot.service';
import { FileUploadService } from '../FILES/fileUpload/fileUpload.service';
import { ResponseResult } from '../../enum/response.enum';
import { Response } from 'express';
import { ConversationService } from '../conversation/conversation.service';
import { AddMessageDto } from '../conversation/dto/add-message.dto';
import { convertConversationToPrompts } from '../../utils/embeddings/convertConversationToPrompts';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { OpenAI } from 'langchain/llms/openai';
import { removeLinks } from '../../utils/urls/removeLinks.util';
import * as moment from 'moment/moment';
import {
  AIMessagePromptTemplate,
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';
import { encode } from 'gpt-3-encoder';
import {
  ChatbotSources,
  ChatbotSourcesDocument,
} from '../chatbot/schemas/chatbotSources.schema';
import * as pMap from 'p-map';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { v4 } from 'uuid';
import { prompts } from './prompts/system.prompts';
import { BufferMemory, ChatMessageHistory } from 'langchain/memory';
import { convertConversationToHistory } from '../../utils/embeddings/convertConversationToHistory';
import { AIChatMessage } from 'langchain/schema';
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
    await this.fileUploadService.deleteChatbotDirectory(chatbot_id);
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
    await this.updatePinecone(this.client, indexName, docs, chatbot_id);
    await this.fileUploadService.deleteChatbotDirectory(chatbot_id);
    return ResponseResult.SUCCESS;
  }

  async askChat(
    payload: AskChatDto,
    response: Response,
  ): Promise<void | string> {
    const { question, chatbot_id, conversation_id, messages } = payload;
    this.client = await createPineconeClient();
    const chatbotInstance = await this.chatbotService.findById(chatbot_id);
    if (!chatbotInstance) {
      throw new HttpException(
        'Chatbot instance not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const isQaListed = this.checkForQAMatch(chatbotInstance.sources, question);
    if (isQaListed) {
      return isQaListed.answer;
    }
    const conversationData = await this.queryPineconeVectorStoreAndQueryLLM(
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

  async queryPineconeVectorStoreAndQueryLLM(
    client: PineconeClient,
    indexName: string,
    question: string,
    chatbotInstance: ChatbotDocument,
    res: Response,
    conversation_id: string,
    messages: ConversationEmbedding[],
  ): Promise<AddMessageDto> {
    const { conversation } = convertConversationToPrompts(messages);

    const { chat_history } = await convertConversationToHistory(messages);
    console.log('=>(embedding.service.ts:121) chat_history', chat_history);
    // 1. Start query process
    console.log('Querying Pinecone vector store...');
    // 2. Retrieve the Pinecone index
    const index = client.Index(indexName);

    let vectorsCount = 0;
    if (chatbotInstance.settings.model === 'gpt-3.5-turbo') {
      vectorsCount = 8;
    } else {
      vectorsCount = 24;
    }

    // 3. Create query embedding
    const queryEmbedding = await new OpenAIEmbeddings({
      modelName: 'text-embedding-ada-002',
    }).embedQuery(`${question}`);

    // 4. Query Pinecone index and return top 5 matches
    const queryResponse = await index.query({
      queryRequest: {
        topK: vectorsCount,
        vector: queryEmbedding,
        includeMetadata: true,
        includeValues: true,
        namespace: chatbotInstance._id.toString(),
      },
    });
    // 5. Log the number of matches
    console.log(`Found ${queryResponse.matches.length} matches...`);
    // 6. Log the question being asked
    if (queryResponse.matches.length) {
      // 7. Create an OpenAI instance and load the QAStuffChain
      const llm = new OpenAI({
        modelName: chatbotInstance.settings.model,
        maxTokens: chatbotInstance.settings.max_tokens,
        temperature: chatbotInstance.settings.temperature,
        streaming: true,
      });

      const uniqueDocuments = queryResponse.matches
        .filter((doc, index, self) => {
          return (
            index ===
            self.findIndex(
              // @ts-ignore
              (t) => t.metadata.pageContent === doc.metadata.pageContent,
            )
          );
        })
        .map((doc) => ({
          ...doc,
          metadata: {
            ...doc.metadata,
            // @ts-ignore
            pageContent: removeLinks(doc.metadata.pageContent),
          },
        }));

      const concatenatedPageContent = uniqueDocuments.map(
        (match) => match.metadata.pageContent.replace(/\n/g, ' '),
        // @ts-ignore
      );

      // Getting the current date and time
      const currentDate = moment();

      // Formatting the date and time in a specific way
      const readableDate: string = currentDate.format(
        'MMMM Do YYYY, h:mm:ss a',
      );

      const chatPrompt = ChatPromptTemplate.fromPromptMessages([
        SystemMessagePromptTemplate.fromTemplate(prompts.optimized_qa),
        // HumanMessagePromptTemplate.fromTemplate(messages[0].content || ''),
        // AIMessagePromptTemplate.fromTemplate(messages[1].content || ''),
        HumanMessagePromptTemplate.fromTemplate(`{question}`),
      ]);

      const assistant_message = '';

      const chainB = new LLMChain({
        prompt: chatPrompt,
        llm: llm,
      });

      const result = await chainB.call(
        {
          history: chat_history,
          language: chatbotInstance.settings.language,
          context: concatenatedPageContent,
          readableDate,
          question,
          additional_prompt: chatbotInstance.settings.base_prompt,
          conversation: JSON.stringify(messages),
        },

        [
          {
            handleLLMNewToken(token: string) {
              res.write(token);
            },
          },
        ],
      );
      const encodedQuestion = encode(JSON.stringify(concatenatedPageContent));
      const encodedAnswer = encode(result.text);
      const token_usage = encodedQuestion.length + encodedAnswer.length;
      console.log(`Tokens used: ${token_usage}`);
      console.log(`USD used ${(token_usage / 1000) * 0.0015}`);
      res.end();
      return {
        conversation_id,
        assistant_message,
        user_message: question,
        matched_vectors: JSON.stringify(concatenatedPageContent),
        chatbot_id: chatbotInstance._id.toString(),
      };
    } else {
      throw new HttpException('No matches found', HttpStatus.BAD_REQUEST);
      // 11. Log that there are no matches, so GPT-3 will not be queried
      // return 'Since there are no matches, GPT-3 will not be queried.';
    }
  }

  checkForQAMatch(chatbotSources: ChatbotSourcesDocument, question: string) {
    const onlyQas = chatbotSources.QA_list;
    return onlyQas.find(
      (item) =>
        item.question.toLowerCase().trim() === question.toLowerCase().trim(),
    );
  }
  async updatePinecone(
    client: PineconeClient,
    indexName: string,
    docs: Record<string, any>[],
    chatbot_id: string,
  ) {
    console.log('=>(updatePinecone.ts:95) docs', docs.length);
    console.log('Retrieving Pinecone index...');
    // 1. Retrieve Pinecone index
    const index = client.Index(indexName);
    // 2. Log the retrieved index name
    console.log(`Pinecone index retrieved: ${indexName}`);
    //delete all prev_indexes
    await index.delete1({
      deleteAll: true,
      namespace: chatbot_id,
    });
    let totalToken = 0;
    const totalDocsSetup = [];
    // 3. Process each document in the docs array
    const docs_updated = [];
    await pMap(
      docs,
      async (doc) => {
        console.log(`Processing document: ${doc.metadata.source}`);
        const txtPath = doc.metadata.source;
        const text = doc.pageContent;
        const encodedEmbedding = encode(doc.pageContent);
        totalToken += encodedEmbedding.length;
        // 4. Create RecursiveCharacterTextSplitter instance
        const textSplitter = new RecursiveCharacterTextSplitter({
          chunkSize: 256,
          chunkOverlap: 0,
        });
        console.log('Splitting text into chunks...');
        console.log(doc.pageContent.length);
        // 5. Split text into chunks (documents)
        const chunks = await textSplitter.createDocuments([text]);
        console.log(`Text split into ${chunks.length} chunks`);
        console.log(
          `Calling OpenAI's Embedding endpoint documents with ${chunks.length} text chunks ...`,
        );

        // 6. Create OpenAI embeddings for documents
        const embeddingsArrays = await new OpenAIEmbeddings({
          modelName: 'text-embedding-ada-002',
        }).embedDocuments(
          chunks.map((chunk) => chunk.pageContent.replace(/\n/g, ' ')),
        );

        console.log('Finished embedding documents');
        console.log(
          `Creating ${chunks.length} vectors array with id, values, and metadata...`,
        );
        // 7. Create and upsert vectors in batches of 100
        const batchSize = 50;
        let batch: any = [];
        for (let idx = 0; idx < chunks.length; idx++) {
          const chunk = chunks[idx];
          if (!totalDocsSetup.includes(chunk.pageContent)) {
            const vector = {
              id: v4(),
              values: embeddingsArrays[idx],
              metadata: {
                ...chunk.metadata,
                loc: JSON.stringify(chunk.metadata.loc),
                pageContent: chunk.pageContent,
                txtPath: txtPath,
              },
            };
            totalDocsSetup.push(chunk.pageContent);
            batch = [...batch, vector];
            // When batch is full, or it's the last item, upsert the vectors
            if (batch.length === batchSize || idx === chunks.length - 1) {
              await index.upsert({
                upsertRequest: {
                  vectors: batch,
                  namespace: chatbot_id,
                },
              });
              // Empty the batch
              batch = [];
            }
          }
        }
        docs_updated.push(doc.metadata.source);
        // 8. Log the number of vectors updated
        console.log(`USD total: ${(totalToken / 1000) * 0.001}`);
        console.log(`Pinecone index updated with ${chunks.length} vectors`);
      },
      { concurrency: parseInt(process.env.PINECONE_UPDATE_CONCURRENCIES) },
    ); // Change concurrency according to your requirements
    console.log(docs_updated);
    return ResponseResult.SUCCESS;
  }
}
