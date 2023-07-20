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
import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import * as fs from 'fs';
@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @UseGuards(AuthJWTGuard)
  @Post('upload')
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
    const fileSize = [];
    for (const file of files) {
      const data = file.buffer;
      const textSize = await pdfParse(data);
      fileSize.push({
        textSize: textSize.text.length,
        name: file.originalname,
      });
      let fileNameExtension = file.originalname.split('.').pop();
      const fileName = `${chatbot_id}-${Date.now()}.${fileNameExtension}`;

      await this.fileUploadService.uploadFile({
        data,
        fileName,
        chatbot_id,
      });
    }
    return fileSize;
  }
  @UseGuards(AuthJWTGuard, ChatbotOwnerGuard)
  @Delete('/remove-crawled')
  async removeWebCrawledFile(@Body() removeFile: RemoveWebCrawledFileDto) {
    return await this.fileUploadService.removeFileFromYandexCloud(removeFile);
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
  async getCharLength(
    @UploadedFiles() files,
    @Body() uploadFile: MultipleFileUploadDto,
  ) {
    const fileSize = [];
    for (const file of files) {
      let fileNameExtension = file.originalname.split('.').pop();
      const data = file.buffer;
      switch (fileNameExtension) {
        case 'pdf':
          const textSize = await pdfParse(data);
          fileSize.push({
            textSize: textSize.text.length,
            name: file.originalname,
          });
          break;
        case 'docx':
          const { value } = await mammoth.extractRawText({ buffer: data });
          fileSize.push({
            textSize: value.length,
            name: file.originalname,
          });
          break;
        case 'txt':
          const text = data.toString('utf-8');
          fileSize.push({
            textSize: text.length,
            name: file.originalname,
          });
      }
    }
    return fileSize;
  }
}
