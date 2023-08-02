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
} from '../../modules/chatbot/chatbot.schema';
import { HttpException, HttpStatus } from '@nestjs/common';
export const queryPineconeVectorStoreAndQueryLLM = async (
  client: PineconeClient,
  indexName: string,
  question: string,
  chatbotInstance: ChatbotDocument,
  res: Response,
): Promise<void> => {
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
      topK: 5,
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
      // @ts-ignore
      .map((match) => match.metadata.pageContent.replace(/\n/g, ''))
      .join(' ');

    if (concatenatedPageContent.length > 5000) {
      concatenatedPageContent = concatenatedPageContent.substring(0, 5000);
    }
    const prompt = JSON.stringify({
      base_prompt: `You are an AI model developed to generate precise and detailed responses to queries. 
      You will be provided with data in a JSON format which will contain the base_rule, a specific question, 
      context, and rules. Your sole source of information is the context field in the JSON, and it is critical that your responses 
      do not incorporate any other sources of information. This means that even if you have been trained on a broad range of data, 
      you must disregard it and strictly adhere to the context given in this JSON data. The base_rule is your primary directive 
      and the question provided is what you must answer. Avoid any extraneous information and make sure your responses 
      do not indicate that you're deriving answers from the given context. Each answer must be in the language specified 
      in the rules and should be exhaustive and comprehensive, offering a complete understanding of the subject asked in the question. 
      Your responses can significantly influence decisions, hence, accuracy and completeness are paramount.`,
      base_rule: chatbotInstance.settings.base_prompt,
      question,
      context: concatenatedPageContent,
      rules: [
        {
          language: `only use the language ${chatbotInstance.settings.language} in answer. Do not use any other language.`,
          context:
            'refer strictly and only to the context provided. Do not use any other sources, and do not mention in your answer that you are using the context.',
        },
        {
          details:
            'Your answer must be as detailed and comprehensive as possible, strictly focused on addressing the question.',
        },
      ],
    });

    const result = await llm.call(prompt, undefined, [
      {
        handleLLMNewToken(token: string) {
          res.write(token);
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
  } else {
    throw new HttpException('No matches found', HttpStatus.BAD_REQUEST);
    // 11. Log that there are no matches, so GPT-3 will not be queried
    // return 'Since there are no matches, GPT-3 will not be queried.';
  }
};
