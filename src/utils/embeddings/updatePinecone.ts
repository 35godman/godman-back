import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PineconeClient } from '@pinecone-database/pinecone';
import { encode } from 'gpt-3-encoder';
import { ResponseResult } from '../../enum/response.enum';
import * as pMap from 'p-map';

export const updatePinecone = async (
  client: PineconeClient,
  indexName: string,
  docs: Record<string, any>[],
  chatbot_id: string,
) => {
  console.log('=>(updatePinecone.ts:95) docs', docs);
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
  // 3. Process each document in the docs array

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
        chunkSize: 512,
      });
      console.log('Splitting text into chunks...');
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
      const batchSize = 512;
      let batch: any = [];
      for (let idx = 0; idx < chunks.length; idx++) {
        const chunk = chunks[idx];
        const vector = {
          id: `${txtPath}_${idx}`,
          values: embeddingsArrays[idx],
          metadata: {
            ...chunk.metadata,
            loc: JSON.stringify(chunk.metadata.loc),
            pageContent: chunk.pageContent,
            txtPath: txtPath,
          },
        };
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
      // 8. Log the number of vectors updated
      console.log(`USD total: ${(totalToken / 1000) * 0.001}`);
      console.log(`Pinecone index updated with ${chunks.length} vectors`);
    },
    { concurrency: 10 },
  ); // Change concurrency according to your requirements

  return ResponseResult.SUCCESS;
};
