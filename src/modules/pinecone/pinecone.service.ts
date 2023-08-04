import { Injectable } from '@nestjs/common';
import { indexName } from '../../utils/embeddings/config';
import { createPineconeClient } from '../../config/pinecone.config';

@Injectable()
export class PineconeService {
  constructor() {}

  async deleteNamespace(chatbot_id: string) {
    const client = await createPineconeClient();
    const index = client.Index(indexName);
    // 2. Log the retrieved index name
    console.log(`Pinecone index retrieved: ${indexName}`);
    //delete all prev_indexes
    await index.delete1({
      deleteAll: true,
      namespace: chatbot_id,
    });
  }
}
