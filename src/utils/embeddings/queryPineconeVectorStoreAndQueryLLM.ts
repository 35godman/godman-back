import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAI } from 'langchain/llms/openai';
import { loadQAStuffChain } from 'langchain/chains';
import { Document } from 'langchain/document';
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
import { UserMessageEmbedding } from '../../modules/embedding/dto/ask-chat.dto';
export const queryPineconeVectorStoreAndQueryLLM = async (
  client: PineconeClient,
  indexName: string,
  question: string,
  chatbotInstance: ChatbotDocument,
  res: Response,
  conversation_id: string,
  user_messages: UserMessageEmbedding[],
): Promise<AddMessageDto> => {
  console.log('=>(utils.ts:14) question', question);
  // 1. Start query process
  console.log('Querying Pinecone vector store...');
  // 2. Retrieve the Pinecone index
  const index = client.Index(indexName);
  // 3. Create query embedding
  const queryEmbedding = await new OpenAIEmbeddings({
    modelName: 'text-embedding-ada-002',
  }).embedQuery(question);
  // 4. Query Pinecone index and return top 5 matches
  const queryResponse = await index.query({
    queryRequest: {
      topK: 10,
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
      modelName: 'gpt-3.5-turbo-16k-0613',
      maxTokens: chatbotInstance.settings.max_tokens,
      temperature: chatbotInstance.settings.temperature,
      streaming: true,
    });

    let concatenatedPageContent = queryResponse.matches
      .map((match) =>
        // @ts-ignore
        match.metadata.pageContent.replace(/\n/g, '').replace(/\u2001/g, ''),
      )
      .join('\n');

    const prompt = `You are an AI designed to generate precise responses, acting as a representative of the company. Your role is strictly to provide information about the company and its products without suggesting any form of contact or sharing contact details. 
 
    Please use only the language ${chatbotInstance.settings.language} in your answers and do not use any other language.
    Address the inquiry below by carefully interpreting and using the information provided in the context. Do not simply copy the context or incorporate any other sources of information. Your answer should be structured and detailed, presenting the company's profile and products clearly and compellingly.
    You are strictly prohibited from sharing any company contact information or suggesting making contact. Your response should be centered around the benefits and accomplishments of the company, focusing on the advantages of our products and their effectiveness, as proven by industrial trials. Context: ${concatenatedPageContent}`;

    const userMessagesStringified = JSON.stringify(user_messages);

    const newPrompt = `${chatbotInstance.settings.base_prompt}
    Please use only the language ${chatbotInstance.settings.language} in your answers and do not use any other language.
       Below are the previous questions posed by the user. Your responses should take these into account and maintain continuity in the conversation:
   User Questions:${userMessagesStringified}
   question: ${question}
    Context: ${concatenatedPageContent}`;
    let assistant_message = '';
    const result = await llm.call(newPrompt, undefined, [
      {
        handleLLMNewToken(token: string) {
          res.write(token);
          assistant_message += token;
        },
      },
    ]);

    // console.log('=>(queryPineconeVectorStoreAndQueryLLM.ts:73) result', result);
    const encodedQuestion = encode(concatenatedPageContent);
    const encodedAnswer = encode(result);
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
