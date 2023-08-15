import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Test } from '@nestjs/testing';
import { User, UserDocument } from './user.schema';
import { userStub } from './stubs/user.stub';
import { AuthJWTGuard } from '../../guards/auth.guard';
import { mockAuthGuard } from '../../guards/__mocks__/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { mockJwtService } from '../../guards/__mocks__/jwt.service';
import { UserCreateDto } from './dto/create.dto';

jest.mock('./user.service');

describe('UsersController', () => {
  let usersController: UserController;
  let usersService: UserService;

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

    usersController = moduleRef.get<UserController>(UserController);
    usersService = moduleRef.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    describe('when getUser is called', () => {
      let user: UserDocument;

      beforeEach(async () => {
        user = await usersController.getByUserId(userStub()._id.toString());
      });

      test('then it should call usersService', () => {
        expect(usersService.findById).toBeCalledWith(userStub()._id.toString());
      });

      test('then is should return a user', () => {
        expect(user).toEqual(userStub());
      });
    });
  });
  describe('create', () => {
    describe('when /register is called', () => {
      let userDto: UserCreateDto;
      let newUser: User;
      beforeEach(async () => {
        userDto = {
          email: 'test@example.com',
          username: 'test',
          password: 'pass',
        };
        newUser = await usersService.create(userDto);
      });

      test('then it should call usersService', async () => {
        expect(usersService.create).toBeCalledWith(userDto);
      });

      test('then is should return a user', () => {
        expect(newUser).toEqual(userStub());
      });
    });
  });
});
