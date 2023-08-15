import { FileUploadDocument } from '../fileUpload.schema';
import { chatbotStub } from '../../../chatbot/stubs/chatbot.stub';

export const fileUploadStub = (): FileUploadDocument => {
  return {
    chatbot: chatbotStub(),
    char_length: 100,
    originalName: 'test',
    storagePath: 'test/root',
    save: jest.fn(),
    populate: jest.fn(),
  } as unknown as FileUploadDocument;
};
