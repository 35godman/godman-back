import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import { FileUploadService } from './fileUpload.service';
import { FileUploadDto } from './dto/file-upload.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthJWTGuard } from '../../guards/auth.guard';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @UseGuards(AuthJWTGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() files, @Request() req) {
    const user_id = req.user._id;
    for (const file of files) {
      const data = file.buffer;
      const fileName = file.originalname;
      await this.fileUploadService.uploadFile({ user_id, fileName, data });
    }
  }
}
