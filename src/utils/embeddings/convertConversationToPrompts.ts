import { ConversationEmbedding } from '../../modules/embedding/dto/ask-chat.dto';
import {
  AIMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from 'langchain/prompts';

export const convertConversationToPrompts = (
  conversation: ConversationEmbedding[],
) => {
  const promptArr = [];
  conversation.forEach((item) => {
    if (item.role === 'user') {
      promptArr.push(HumanMessagePromptTemplate.fromTemplate(item.content));
    } else if (item.role === 'assistant') {
      promptArr.push(AIMessagePromptTemplate.fromTemplate(item.content));
    }
  });
  return promptArr;
};
