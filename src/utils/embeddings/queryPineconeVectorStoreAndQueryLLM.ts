import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAI } from 'langchain/llms/openai';
import { loadQAStuffChain } from 'langchain/chains';
import { Document } from 'langchain/document';
import { timeout } from './config';
import { encode } from 'gpt-3-encoder';
import { PineconeClient } from '@pinecone-database/pinecone';
import {
  Chatbot,
  ChatbotDocument,
  ChatbotSchema,
} from '../../modules/chatbot/chatbot.schema';
export const queryPineconeVectorStoreAndQueryLLM = async (
  client: PineconeClient,
  indexName: string,
  question: string,
  chatbotInstance: ChatbotDocument,
) => {
  console.log('=>(utils.ts:14) question', question);
  // 1. Start query process
  console.log('Querying Pinecone vector store...');
  // 2. Retrieve the Pinecone index
  const index = client.Index(indexName);
  // 3. Create query embedding
  const queryEmbedding = await new OpenAIEmbeddings().embedQuery(question);
  // 4. Query Pinecone index and return top 10 matches
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
      modelName: chatbotInstance.settings?.model || 'gpt-3.5-turbo-0613',
      maxTokens: chatbotInstance.settings?.max_tokens || 300,
      temperature: chatbotInstance.settings?.temperature || 1,
    });

    const chain = loadQAStuffChain(llm);
    //8. Extract and concatenate page content from matched documents

    let concatenatedPageContent = queryResponse.matches
      // @ts-ignore
      .map((match) => match.metadata.pageContent.replace(/\n/g, ''))
      .join(' ');

    // if (concatenatedPageContent.length > 500) {
    //   concatenatedPageContent = concatenatedPageContent.substring(0, 500);
    // }

    // 9. Execute the chain with input documents and question
    const result = await chain.call({
      input_documents: [
        new Document({
          pageContent: concatenatedPageContent,
        }),
      ],
      question:
        `only use the language in which the question is asked.` + question,
    });
    //10. Log the answer
    console.log(`Answer: ${result.text}`);
    const encodedQuestion = encode(concatenatedPageContent);
    const encodedAnswer = encode(result.text);
    const token_usage = encodedQuestion.length + encodedAnswer.length;
    console.log(`Tokens used: ${token_usage}`);
    console.log(`USD used ${(token_usage / 1000) * 0.0015}`);
    return result.text;
  } else {
    // 11. Log that there are no matches, so GPT-3 will not be queried
    console.log('Since there are no matches, GPT-3 will not be queried.');
  }
};
