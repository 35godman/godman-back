import { PineconeStore } from 'langchain/vectorstores';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeClient } from '@pinecone-database/pinecone';
import { ChatbotDocument } from '../../modules/chatbot/schemas/chatbot.schema';
import { ConversationEmbedding } from '../../modules/embedding/dto/ask-chat.dto';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from 'langchain/prompts';
import { ConversationalRetrievalQAChain, LLMChain } from 'langchain/chains';
import { OpenAI } from 'langchain/llms/openai';
import { Response } from 'express';
import { VectorOperationsApi } from '@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch';
type VectorStoreQueryParams = {
  index: VectorOperationsApi;
  question: string;
  chatbotInstance: ChatbotDocument;
  res: Response;
  conversation_id: string;
  messages: ConversationEmbedding[];
};

export const vectorStoreQuery = async ({
  index,
  question,
  chatbotInstance,
  res,
  conversation_id,
  messages,
}: VectorStoreQueryParams): Promise<void> => {
  const vectorStores = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex: index, namespace: chatbotInstance._id.toString() },
  );
  const vector = await vectorStores.similaritySearch(question, 3, {});
  console.log('=>(vectorStoreQuery.ts:36) vector', vector);
  const llm = new OpenAI({
    modelName: chatbotInstance.settings.model,
    maxTokens: chatbotInstance.settings.max_tokens,
    temperature: chatbotInstance.settings.temperature,
    // streaming: true,
  });
  const CUSTOM_QUESTION_GENERATOR_CHAIN_PROMPT = `Given the following conversation and a follow up question, 
  return the conversation history excerpt that includes any relevant context to the question if it exists and 
  rephrase the follow up question to be a standalone question.
Context:
{context}
Follow Up Input: {question}
Your answer should follow the following format:
\`\`\`
Use the following pieces of context to answer the users question.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
----------------
Standalone question: {question}
\`\`\`
Your answer:`;

  const chain = ConversationalRetrievalQAChain.fromLLM(
    llm,
    vectorStores.asRetriever(),
    {
      questionGeneratorChainOptions: {
        template: CUSTOM_QUESTION_GENERATOR_CHAIN_PROMPT,
      },
    },
  );
  const response = await chain.call({
    context: vector,
    question,
  });
  console.log('=>(vectorStoreQuery.ts:60) response', response);
  //return response;
};
function formattedResults(results) {
  const formattedResults = results.map((doc) => {
    const role = doc.metadata.role;
    const message = doc.pageContent;

    if (role === 'User') {
      return `user: "${message}."`;
    } else if (role === 'Assistant') {
      return `assistant: "${message}."`;
    } else {
      return '';
    }
  });

  return formattedResults.join('\n');
}
