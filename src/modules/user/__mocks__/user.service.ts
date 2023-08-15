import { userStub } from '../stubs/user.stub';

export const UserService = jest.fn().mockReturnValue({
  create: jest.fn((userDto) => {
    return {
      ...userStub(),
      username: userDto.username,
      email: userDto.email,
      pass: userDto.pass,
    };
  }),
  findById: jest.fn().mockReturnValue(userStub()),
  findByUsername: jest.fn().mockReturnValue(userStub()),
});
