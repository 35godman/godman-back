import { ConversationEmbedding } from '../../modules/embedding/dto/ask-chat.dto';
import {
  AIMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from 'langchain/prompts';

export const convertConversationToPrompts = (
  conversation: ConversationEmbedding[],
) => {
  const promptArr = [];
  const usersQuestion = [];
  conversation.forEach((item) => {
    if (item.role === 'user') {
      promptArr.push(HumanMessagePromptTemplate.fromTemplate(item.content));
      usersQuestion.push(item.content);
    } else if (item.role === 'assistant') {
      promptArr.push(
        AIMessagePromptTemplate.fromTemplate(
          item.content.replace(/{/g, '').replace(/}/g, ''),
        ),
      );
    }
  });
  // conversation.forEach((item) => {
  //   if (item.role === 'user') {
  //     promptArr.push(HumanMessagePromptTemplate.fromTemplate(item.content));
  //   }
  // });
  return { conversation: promptArr, userQuestion: usersQuestion.join(',') };
};
