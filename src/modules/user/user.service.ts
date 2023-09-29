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
    const { password, email, username } = user;
    console.log(user);
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
      email,
    });
    const createdUser = new this.userModel({
      ...user,

      password: hashedPassword,
    });

    return await createdUser.save();
  }

  async findById(id: string): Promise<UserDocument> {
    return await this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument> {
    return await this.userModel.findOne({ email }).exec();
  }

  async findByEmailOrUsername(emailOrUsername: string): Promise<UserDocument> {
    return await this.userModel
      .findOne({
        $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
      })
      .exec();
  }
}
