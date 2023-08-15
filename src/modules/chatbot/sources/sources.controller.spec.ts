import { Test, TestingModule } from '@nestjs/testing';
import { SourcesController } from './sources.controller';
import { SourcesService } from './sources.service';
import { AddQnaDto } from '../../FILES/fileUpload/dto/add-qna.dto';
import { chatbotStub } from '../stubs/chatbot.stub';
import { mockAuthGuard } from '../../../guards/__mocks__/auth.guard';
import { AuthJWTGuard } from '../../../guards/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { mockJwtService } from '../../../guards/__mocks__/jwt.service';
import { mockChatbotOwnerGuard } from '../../../guards/__mocks__/chatbot-owner.guard';
import { ChatbotOwnerGuard } from '../../../guards/chatbot-owner.guard';
import { ChatbotService } from '../chatbot.service';

jest.mock('./sources.service.ts');
jest.mock('../../../guards/__mocks__/auth.guard.ts');
jest.mock('../../../guards/__mocks__/chatbot-owner.guard.ts');
jest.mock('../chatbot.service.ts');

describe('SourcesController', () => {
  let sourcesController: SourcesController;
  let sourcesService: SourcesService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SourcesController],
      providers: [
        SourcesService,
        ChatbotService,
        {
          provide: AuthJWTGuard,
          useValue: mockAuthGuard,
        },
        {
          provide: ChatbotOwnerGuard,
          useValue: mockChatbotOwnerGuard,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    sourcesService = moduleRef.get<SourcesService>(SourcesService);
    sourcesController = moduleRef.get<SourcesController>(SourcesController);
    jest.clearAllMocks();
  });

  describe('add-qna', () => {
    it('should return http status code', async () => {
      const result = 200;

      const QAs: AddQnaDto = {
        data: [],
      };
      const chatbot_id = chatbotStub()._id.toString();

      expect(await sourcesController.addQnaHandler(QAs, chatbot_id)).toBe(
        result,
      );
    });
  });
});
