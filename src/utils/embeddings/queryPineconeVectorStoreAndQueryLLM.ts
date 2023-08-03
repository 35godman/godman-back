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
      // @ts-ignore
      .map((match) => match.metadata.pageContent.replace(/\n/g, ''))
      .join(' ');

    // if (concatenatedPageContent.length > 5000) {
    //   concatenatedPageContent = concatenatedPageContent.substring(0, 5000);
    // }
    // const prompt = JSON.stringify({
    //   base_prompt: `You are an AI model developed to generate precise and detailed responses to queries.
    //   You will be provided with data in a JSON format which will contain the base_rule, a specific question,
    //   context, and rules. Your sole source of information is the context field in the JSON, and it is critical that your responses
    //   do not incorporate any other sources of information.  The base_rule and rules is your primary directive
    //   and the question provided is what you must answer. Avoid any extraneous information and make sure your responses
    //   do not indicate that you're deriving answers from the given context`,
    //   base_rule: chatbotInstance.settings.base_prompt,
    //   question,
    //   rules: [
    //     {
    //       language: `only use the language ${chatbotInstance.settings.language} in answer. Do not use any other language.`,
    //       contact_info:
    //         'Dont ask to contact the company and dont provide any contact information',
    //       context:
    //         'refer strictly and only to the context provided. Do not use any other sources, and do not mention in your answer that you are using the context.',
    //     },
    //     {
    //       details:
    //         'Your answer must be as detailed and comprehensive as possible, strictly focused on addressing the question.',
    //     },
    //   ],
    //   context: concatenatedPageContent,
    // });
    const prompt = `You are an AI designed to generate precise responses, acting as a representative of the company. Your role is strictly to provide information about the company and its products without suggesting any form of contact or sharing contact details. 
    ${chatbotInstance.settings.base_prompt}
    Please use only the language ${chatbotInstance.settings.language} in your answers and do not use any other language.
    Address the inquiry below by carefully interpreting and using the information provided in the context. Do not simply copy the context or incorporate any other sources of information. Your answer should be structured and detailed, presenting the company's profile and products clearly and compellingly.
    You are strictly prohibited from sharing any company contact information or suggesting making contact. Your response should be centered around the benefits and accomplishments of the company, focusing on the advantages of our products and their effectiveness, as proven by industrial trials. Context: ${concatenatedPageContent}`;

    const newPrompt = `
    Your role is strictly to provide information about the company from context and its products without suggesting any form of contact or sharing contact details.
    Please use only the language ${chatbotInstance.settings.language} in your answers and do not use any other language.
    As a company assistant chatbot, your goal is to act as an assistant and consultant to users, while also increasing the company's sales through effective communication skills. Your task is to maximize the number of questions answered and provide detailed information about the company in a correct, honest, and specific manner, strictly following the correct answer structure.
    Your responses should be tailored to meet the needs of the users, demonstrating a strong understanding of their questions and providing clear and accurate information. You should strive to provide comprehensive and helpful answers that address the specific inquiries of the users while also highlighting the key benefits and features of the company's products or services.
    To increase sales, you should incorporate persuasive language and techniques in your responses, focusing on the unique selling points of the company and how they can meet the needs and desires of the users. Your responses should be engaging, compelling, and built to guide users towards taking the desired action, such as making a purchase or scheduling a consultation.
    Please note that while adhering to a correct answer structure is important, you should also strive to be conversational and friendly in your communication style. This will help create a positive and engaging user experience, fostering trust and encouraging users to explore the company's offerings.
    Remember to continuously improve your communication skills by analyzing user interactions, identifying areas for improvement, and incorporating feedback to provide even better assistance and drive higher sales for the company.
    Context: ${concatenatedPageContent}`;

    const result = await llm.call(newPrompt, undefined, [
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
