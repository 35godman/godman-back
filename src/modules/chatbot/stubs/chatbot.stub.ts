import { Chatbot, ChatbotDocument } from '../schemas/chatbot.schema';
import settingsStub from './settings.stub';
import mongoose from 'mongoose';
import { sourcesStub } from './sources.stub';
import { userStub } from '../../user/stubs/user.stub';

export const chatbotStub = (): ChatbotDocument => {
  return {
    _id: new mongoose.Types.ObjectId(),
    owner: userStub()._id,
    chatbot_name: 'My chatbot',
    settings: settingsStub()._id,
    conversations: [new mongoose.Types.ObjectId()],
    sources: sourcesStub()._id,
    embed_code: {
      iframe: '',
      script: '',
    },
    share_link: null,

    save: jest.fn(),
    populate: jest.fn(),
    // ... add other methods you might be using in your tests
  } as unknown as ChatbotDocument;
};
