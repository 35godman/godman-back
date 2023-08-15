import { Prop } from '@nestjs/mongoose';
import { UserDocument } from '../user.schema';
import mongoose from 'mongoose';

export const userStub = (): UserDocument => {
  return {
    _id: new mongoose.Types.ObjectId('64db8b3be12cffb39d4e5a7a'),

    email: 'test@example.com',

    plan: 'free',

    username: 'test',

    password: 'pass',

    chatbot_limit: 2000000,

    language: 'russian',
  } as unknown as UserDocument;
};
