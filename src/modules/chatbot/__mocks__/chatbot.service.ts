import { chatbotStub } from '../stubs/chatbot.stub';
import { ResponseResult } from '../../../enum/response.enum';

export const ChatbotService = jest.fn().mockReturnValue({
  createDefault: jest.fn().mockReturnValue(chatbotStub()),
  findById: jest.fn().mockReturnValue(chatbotStub()),
  findByUser: jest.fn().mockReturnValue(chatbotStub()),
  delete: jest.fn().mockReturnValue(ResponseResult.SUCCESS),
  generateIframeCode: jest.fn().mockReturnValue(ResponseResult.SUCCESS),
  getChatbotForIframe: jest.fn().mockReturnValue(chatbotStub()),
});
