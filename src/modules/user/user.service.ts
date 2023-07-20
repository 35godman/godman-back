import { Logger } from 'winston';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { User, UserDocument } from './user.schema';
import { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { InjectModel } from '@nestjs/mongoose';
import { UserCreateDto } from './dto/create.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}
  async create(user: UserCreateDto): Promise<User> {
    const { password, username, email } = user;
    const existingUser = await this.userModel
      .findOne({
        $or: [{ email: email }, { username: username }],
      })
      .exec();
    if (existingUser) {
      throw new HttpException(
        'Username or email already exists',
        HttpStatus.CONFLICT,
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    this.logger.info({
      route: 'register',
      username,
      email,
    });
    const createdUser = new this.userModel({
      ...user,
      password: hashedPassword,
    });

    return await createdUser.save();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    console.log('=>(user.service.ts:45) user', user);
    return user;
  }

  async findByUsername(username: string): Promise<UserDocument> {
    return await this.userModel.findOne({ username }).exec();
  }
}
