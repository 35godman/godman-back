import mongoose from 'mongoose';
import { ChatbotSourcesDocument } from '../schemas/chatbotSources.schema';

export const sourcesStub = (): ChatbotSourcesDocument => {
  return {
    chatbot_id: new mongoose.Types.ObjectId() as any, // Casting to any for simplification
    files: [], // Empty array as default
    text: '',
    website: [], // Empty array as default
    crawling_status: null,
    last_crawled_data: null,
    QA_list: [], // Empty array as default

    // Adding Mongoose Document methods (stubbing for simplicity)
    save: jest.fn(),
    populate: jest.fn(),
    markModified: jest.fn(),
    execPopulate: jest.fn(),

    // ... add any other methods/properties as required
  } as unknown as ChatbotSourcesDocument; // Two-step type assertion to ensure compatibility
};
