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

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @UseGuards(AuthJWTGuard)
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFile(
    @UploadedFiles() files,
    @Body() uploadFile: MultipleFileUploadDto,
  ) {
    const { chatbot_id } = uploadFile;
    for (const file of files) {
      const data = file.buffer;
      let fileNameExtension = file.originalname.split('.').pop();
      const fileName = `${chatbot_id}-${Date.now()}.${fileNameExtension}`;

      await this.fileUploadService.uploadFile({
        data,
        fileName,
        chatbot_id,
      });
    }
  }

  @Delete('/remove-crawled')
  async removeWebCrawledFile(@Body() removeFile: RemoveWebCrawledFileDto) {
    return await this.fileUploadService.removeFileFromYandexCloud(removeFile);
  }
}
