import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAI } from 'langchain/llms/openai';
import { LLMChain, loadQAStuffChain, VectorDBQAChain } from 'langchain/chains';
import { timeout } from './config';
import { encode } from 'gpt-3-encoder';
import { Response } from 'express';
import { PineconeClient } from '@pinecone-database/pinecone';
import {
  Chatbot,
  ChatbotDocument,
  ChatbotSchema,
} from '../../modules/chatbot/schemas/chatbot.schema';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AddMessageDto } from '../../modules/conversation/dto/add-message.dto';
import { MessageState } from '../../modules/conversation/types/message.type';
import * as moment from 'moment';
import { removeLinks } from '../urls/removeLinks.util';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from 'langchain/prompts';
import { ConversationEmbedding } from '../../modules/embedding/dto/ask-chat.dto';
import { convertConversationToPrompts } from './convertConversationToPrompts';

export const queryPineconeVectorStoreAndQueryLLM = async (
  client: PineconeClient,
  indexName: string,
  question: string,
  chatbotInstance: ChatbotDocument,
  res: Response,
  conversation_id: string,
  messages: ConversationEmbedding[],
): Promise<AddMessageDto> => {
  console.log('=>(utils.ts:14) question', question);
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
  }).embedQuery(question);

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
  console.log(`Asking question: ${question}...`);
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

    let concatenatedPageContent = uniqueDocuments
      .map((match) =>
        // @ts-ignore
        match.metadata.pageContent.replace(/\n/g, '').replace(/\u2001/g, ''),
      )
      .join('\n');
    //returns chat_history (5 latest msg)
    const conversation = convertConversationToPrompts(messages);
    // Getting the current date and time
    const currentDate = moment();

    // Formatting the date and time in a specific way
    const readableDate: string = currentDate.format('MMMM Do YYYY, h:mm:ss a');

    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      ...conversation,
      HumanMessagePromptTemplate.fromTemplate(`
      Base prompt: {chatbot_prompt}
      Context:
      {context}

      Follow Up Input: {question}
      Use the following pieces of context to answer the user's question.
      If the answer is not found within the context, respond with 'Hmm, I am not sure.' 
      Refuse to answer any question not about the information contained within the context. 
      Maintain a formal tone, and always act as 'AI Assistant,' a document providing information.

      ----------------
      Standalone question: {question}
      \`\`\`
      Your answer:
      - Language used for the conversation: {language}
      - Date today is {readableDate}
  `),
    ]);

    let assistant_message = '';
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
};
