import { SourcesController } from '../chatbot/sources/sources.controller';
import { SourcesService } from '../chatbot/sources/sources.service';
import { Test } from '@nestjs/testing';
import { ChatbotService } from '../chatbot/chatbot.service';
import { AuthJWTGuard } from '../../guards/auth.guard';
import { mockAuthGuard } from '../../guards/__mocks__/auth.guard';
import { ChatbotOwnerGuard } from '../../guards/chatbot-owner.guard';
import { mockChatbotOwnerGuard } from '../../guards/__mocks__/chatbot-owner.guard';
import { JwtService } from '@nestjs/jwt';
import { mockJwtService } from '../../guards/__mocks__/jwt.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { userStub } from './stubs/user.stub';
import { HttpException, HttpStatus } from '@nestjs/common';
import { rootMongooseTestModule } from '../../config/mongo-memory-saver/mongo-memory-saver.config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';

jest.mock('./user.service.ts');

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: AuthJWTGuard,
          useValue: mockAuthGuard,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    userService = moduleRef.get<UserService>(UserService);
    userController = moduleRef.get<UserController>(UserController);
    jest.clearAllMocks();
  });
  describe('create', () => {
    it('creates new user', async () => {
      const result = userStub();
      const createBody = {
        email: 'test@example.com',
        username: 'test',
        password: 'pass',
      };
      const fnRes = await userService.create(createBody);
      expect(fnRes).toEqual(result);
    });
  });

  it('throws error if database fails', async () => {
    userService.create = jest.fn();
    const createBody = {
      email: 'test@example.com',
      username: 'test',
      password: 'pass',
    };

    jest
      .spyOn(userService, 'create')
      .mockRejectedValueOnce(new Error('Database error'));
    await expect(userService.create(createBody)).rejects.toThrow(
      new Error('Database error'),
    );
  });
});
