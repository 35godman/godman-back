import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAI } from 'langchain/llms/openai';
import { LLMChain, loadQAStuffChain } from 'langchain/chains';
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
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from 'langchain/prompts';
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
      topK: 50,
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

    let concatenatedPageContent = queryResponse.matches
      .map((match) =>
        // @ts-ignore
        match.metadata.pageContent.replace(/\n/g, '').replace(/\u2001/g, ''),
      )
      .join('\n');
    if (chatbotInstance.settings.model === 'gpt-3.5-turbo') {
      concatenatedPageContent = concatenatedPageContent.substring(0, 5000);
    }

    const userMessagesStringified = JSON.stringify(user_messages);
    const currentYear = new Date().getFullYear();
    const newPrompt = `${chatbotInstance.settings.base_prompt}
    Today is ${currentYear} year.
   Language:  ${chatbotInstance.settings.language}
   Previous User Questions:${userMessagesStringified}
   Question: ${question}
    Context: ${concatenatedPageContent}`;
    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(
        `{chatbot_prompt}
- Language used for the conversation: {language}
- User's past questions: {user_questions}
- The context of the ongoing conversation: {context}
`,
      ),
      HumanMessagePromptTemplate.fromTemplate(`{question}`),
    ]);
    let assistant_message = '';
    const chainB = new LLMChain({
      prompt: chatPrompt,
      llm: llm,
    });
    const result = await chainB.call(
      {
        language: chatbotInstance.settings.language,
        user_questions: userMessagesStringified,
        context: concatenatedPageContent,
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
