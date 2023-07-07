import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthJWTGuard } from '../../guards/auth.guard';
import { UserCreateDto } from './dto/create.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  //@UseGuards(AuthJWTGuard)
  @Post('register')
  create(@Body() createSearchDto: UserCreateDto) {
    return this.userService.create(createSearchDto);
  }

  @UseGuards(AuthJWTGuard)
  @Get('id/:id')
  getByUserId(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.userService.findById(id);
  }
}
