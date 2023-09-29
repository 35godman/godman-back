import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();
import { User, UserDocument } from '../user/user.schema';
import { JwtPayload } from './interfaces/jwt-payload.type';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async generateJwt({ user_id }: { user_id: string }) {
    return {
      access_token: await this.jwtService.signAsync({ user_id }),
    };
  }
  async login(payload: LoginDto): Promise<any> {
    const { email, password } = payload;
    const user = await this.userService.findByEmailOrUsername(email);
    if (!user) {
      throw new NotFoundException('Email not found.');
    }
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = await this.generateJwt({ user_id: user._id.toString() });
      user.password = '';
      return { user, token };
    } else {
      // this.logger.error({ route: 'login', error: 'UnauthorizedException' });
      throw new NotFoundException('Password incorrect');
    }
  }
}
