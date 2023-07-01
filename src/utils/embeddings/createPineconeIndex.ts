
import { timeout } from './config';
export const createPineconeIndex = async (
    client,
    indexName,
    vectorDimension,
) => {
    // 1. Initiate index existence check
    console.log(`Checking "${indexName}"...`);
    // 2. Get list of existing indexes
    const existingIndexes = await client.listIndexes();
    // 3. If index doesn't exist, create it
    if (!existingIndexes.includes(indexName)) {
        // 4. Log index creation initiation
        console.log(`Creating "${indexName}"...`);
        // 5. Create index
        await client.createIndex({
            createRequest: {
                name: indexName,
                dimension: vectorDimension,
                metric: 'cosine',
            },
        });
        // 6. Log successful creation
        console.log(
            `Creating index.... please wait for it to finish initializing.`,
        );
        // 7. Wait for index initialization
        await new Promise((resolve) => setTimeout(resolve, timeout));
    } else {
        // 8. Log if index already exists
        console.log(`"${indexName}" already exists.`);
    }
};
