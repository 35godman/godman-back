import {
  Controller,
  Post,
  Body,
  Inject,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { AuthJWTGuard } from '../../guards/auth.guard';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    try {
      return this.authService.login(loginDto);
    } catch (e) {
      //this.logger.error(`login ${e.message}`);
    }
  }
  @UseGuards(AuthJWTGuard)
  @Get('relogin')
  async relogin(@Req() req) {
    const { sub } = req.user;
    return await this.userService.findById(sub);
  }
}
