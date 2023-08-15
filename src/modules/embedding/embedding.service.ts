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
import { AskChatDto, ConversationEmbedding } from './dto/ask-chat.dto';
import { Chatbot, ChatbotDocument } from '../chatbot/schemas/chatbot.schema';
import { ChatbotService } from '../chatbot/chatbot.service';
import { FileUploadService } from '../FILES/fileUpload/fileUpload.service';
import { ResponseResult } from '../../enum/response.enum';
import { Response } from 'express';
import { ConversationService } from '../conversation/conversation.service';
import { vectorStoreQuery } from '../../utils/embeddings/vectorStoreQuery';
import { AddMessageDto } from '../conversation/dto/add-message.dto';
import { convertConversationToPrompts } from '../../utils/embeddings/convertConversationToPrompts';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { OpenAI } from 'langchain/llms/openai';
import { removeLinks } from '../../utils/urls/removeLinks.util';
import * as moment from 'moment/moment';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
} from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';
import { encode } from 'gpt-3-encoder';
import {
  ChatbotSources,
  ChatbotSourcesDocument,
} from '../chatbot/schemas/chatbotSources.schema';
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
    const { userQuestion } = convertConversationToPrompts(messages);
    // 1. Start query process
    console.log('Querying Pinecone vector store...');
    // 2. Retrieve the Pinecone index
    const index = client.Index(indexName);

    let vectorsCount = 0;
    if (chatbotInstance.settings.model === 'gpt-3.5-turbo') {
      vectorsCount = 6;
    } else {
      vectorsCount = 24;
    }

    // 3. Create query embedding
    const queryEmbedding = await new OpenAIEmbeddings({
      modelName: 'text-embedding-ada-002',
    }).embedQuery(`${question} ${userQuestion}`);

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

      const concatenatedPageContent = uniqueDocuments
        .map((match) =>
          // @ts-ignore
          match.metadata.pageContent.replace(/\n/g, ' '),
        )
        .join('\n');
      //returns chat_history (2 latest msg)

      // Getting the current date and time
      const currentDate = moment();

      // Formatting the date and time in a specific way
      const readableDate: string = currentDate.format(
        'MMMM Do YYYY, h:mm:ss a',
      );

      const chatPrompt = ChatPromptTemplate.fromPromptMessages([
        HumanMessagePromptTemplate.fromTemplate(`
     Context: {context}
    Answer must be in language: {language}
    User's Original Question: {question}
    User's previous messages and your previous answer {messages}
   {chatbot_prompt}`),
      ]);

      const assistant_message = '';
      const chainB = new LLMChain({
        prompt: chatPrompt,
        llm: llm,
      });

      const result = await chainB.call(
        {
          language: chatbotInstance.settings.language,
          context: concatenatedPageContent,
          readableDate,
          question,
          chatbot_prompt: chatbotInstance.settings.base_prompt,
          messages,
        },
        [
          {
            handleLLMNewToken(token: string) {
              res.write(token);
            },
          },
        ],
      );
      const encodedQuestion = encode(concatenatedPageContent);
      const encodedAnswer = encode(result.text);
      const token_usage = encodedQuestion.length + encodedAnswer.length;
      console.log(`Tokens used: ${token_usage}`);
      console.log(`USD used ${(token_usage / 1000) * 0.0015}`);
      res.end();
      return {
        conversation_id,
        assistant_message,
        user_message: question,
        matched_vectors: concatenatedPageContent,
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
}
