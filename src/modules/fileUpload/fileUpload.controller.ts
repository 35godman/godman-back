import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Request,
  UploadedFiles,
  Delete,
  Query,
} from '@nestjs/common';
import { FileUploadService } from './fileUpload.service';
import { FileUploadDto } from './dto/file-upload.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AuthJWTGuard } from '../../guards/auth.guard';
import { MultipleFileUploadDto } from './dto/multiple-file-upload.dto';
import { convertFilenameToUtf8 } from '../../helpers/convertFileNameToUtf8';
import * as iconv from 'iconv-lite';
import { v4 as uuidv4 } from 'uuid';
import { RemoveWebCrawledFileDto } from './dto/RemoveWebCrawledFile.dto';
import { globalConfig } from '../../config/global.config';
import { ChatbotOwnerGuard } from '../../guards/chatbot-owner.guard';

import { ResponseResult } from '../../enum/response.enum';
@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @UseGuards(AuthJWTGuard)
  @Post('multi-upload')
  @UseInterceptors(
    FilesInterceptor('files', globalConfig.MAX_FILE_AMOUNT, {
      limits: {
        fileSize: globalConfig.MAX_FILE_SIZE,
      },
    }),
  )
  async uploadFile(
    @UploadedFiles() files,
    @Body() uploadFile: MultipleFileUploadDto,
  ) {
    const { chatbot_id } = uploadFile;
    for (const file of files) {
      const data = file.buffer;
      const fileName = decodeURIComponent(file.originalname);

      await this.fileUploadService.uploadSingleFile({
        data,
        fileName,
        chatbot_id,
      });
    }
    return ResponseResult.SUCCESS;
  }
  @UseGuards(AuthJWTGuard, ChatbotOwnerGuard)
  @Delete('/remove-crawled')
  async removeWebCrawledFile(@Body() removeFile: RemoveWebCrawledFileDto) {
    return await this.fileUploadService.removeFileFromYandexCloud(removeFile);
  }

  @UseGuards(AuthJWTGuard)
  @Post('single-upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: globalConfig.MAX_FILE_SIZE,
      },
    }),
  )
  async uploadSingleFile(@UploadedFile() file, @Query() chatbot_id: string) {
    const fileName = decodeURIComponent(file.originalname);
    await this.fileUploadService.uploadSingleFile({
      fileName,
      chatbot_id,
      data: file.buffer,
    });
    return ResponseResult.SUCCESS;
  }

  @UseGuards(AuthJWTGuard)
  @Post('get-char-length')
  @UseInterceptors(
    FilesInterceptor('files', globalConfig.MAX_FILE_AMOUNT, {
      limits: {
        fileSize: globalConfig.MAX_FILE_SIZE,
      },
    }),
  )
  async getCharLength(@UploadedFiles() files) {
    return await this.fileUploadService.getFileTextLength(files);
  }
}
