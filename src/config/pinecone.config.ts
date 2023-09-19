import { PineconeClient } from '@pinecone-database/pinecone';

export const createPineconeClient = async (): Promise<PineconeClient> => {
  const client = new PineconeClient();

  await client.init({
    apiKey: process.env.PINECONE_API_KEY || '',
    environment: process.env.PINECONE_ENVIRONMENT || '',
  });
  console.log('=>(pinecone.config.ts:5) client', client);
  return client;
};
