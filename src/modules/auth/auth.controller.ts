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
import { RateLimitGuard } from '../../guards/rate-limit.guard';
import { Reflector } from '@nestjs/core';
import { RateLimitService } from '../rate-limit/rate-limit.service';
import { ChatbotService } from '../chatbot/chatbot.service';
import {
  ThrottlerGuard,
  ThrottlerModuleOptions,
  ThrottlerStorage,
} from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @UseGuards(RateLimitGuard)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(AuthJWTGuard)
  @Get('relogin')
  async relogin(@Req() req) {
    const { user_id } = req.user;
    return await this.userService.findById(user_id);
  }
}
