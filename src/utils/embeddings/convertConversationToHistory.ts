import { ConversationEmbedding } from '../../modules/embedding/dto/ask-chat.dto';
import { BaseChatMessage } from 'langchain/schema';
import { ChatMessageHistory } from 'langchain/memory';
import * as pMap from 'p-map';

export const convertConversationToHistory = async (
  conversation: ConversationEmbedding[],
) => {
  const history = new ChatMessageHistory();
  await pMap(
    conversation,
    async (message) => {
      if (message.role === 'user') {
        await history.addUserMessage(message.content);
      } else if (message.role === 'assistant') {
        await history.addAIChatMessage(message.content);
      }
    },
    { concurrency: 2 },
  );
  return { chat_history: history };
};
