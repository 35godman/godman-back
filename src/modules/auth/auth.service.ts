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

  async generateJwt(username: string) {
    const payload = { username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
  async login(payload: LoginDto): Promise<any> {
    const { username, password } = payload;
    const user = await this.userService.findByUsername(username);
    if (!user) {
      throw new NotFoundException('Username not found.');
    }
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = await this.generateJwt(user.username);
      user.password = '';
      return { user, token };
    } else {
      // this.logger.error({ route: 'login', error: 'UnauthorizedException' });
      throw new NotFoundException('Password incorrect');
    }
  }
}
