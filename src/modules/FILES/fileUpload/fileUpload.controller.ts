import {
  Body,
  Controller,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileUploadService } from './fileUpload.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AuthJWTGuard } from '../../../guards/auth.guard';
import { MultipleFileUploadDto } from './dto/multiple-file-upload.dto';
import { RemoveWebCrawledFileDto } from './dto/RemoveWebCrawledFile.dto';
import { globalConfig } from '../../../config/global.config';

import { ResponseResult } from '../../../enum/response.enum';
import { CategoryEnum } from '../../../enum/category.enum';
import { TextUploadDto } from './dto/text-upload.dto';
import { FileUploadDto } from './dto/file-upload.dto';
import { RemoveUploadedFileDto } from './dto/RemoveUploadedFile.dto';
import { AddQnaDto } from './dto/add-qna.dto';
import { ChatbotOwnerGuard } from '../../../guards/chatbot-owner.guard';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @UseGuards(AuthJWTGuard, ChatbotOwnerGuard)
  @Post('multi-upload')
  @UseInterceptors(
    FilesInterceptor('files', globalConfig.MAX_FILE_AMOUNT, {
      limits: {
        fileSize: globalConfig.MAX_FILE_SIZE,
      },
    }),
  )
  async dataSourceUploadManyFiles(
    @UploadedFiles() files,
    @Query('chatbot_id') chatbot_id: string,
  ) {
    for (const file of files) {
      const data = file.buffer;
      const fileName = decodeURIComponent(file.originalname);

      const charLength = await this.fileUploadService.getOneFileLength(file);

      await this.fileUploadService.uploadSingleFile(
        {
          data,
          fileName,
          chatbot_id,
          char_length: charLength.textSize,
        },
        CategoryEnum.FILE,
      );
    }
    return ResponseResult.SUCCESS;
  }
  @UseGuards(AuthJWTGuard, ChatbotOwnerGuard)
  @Post('remove-crawled')
  async removeWebCrawledFile(
    @Body() removeFile: RemoveWebCrawledFileDto,
    @Query('chatbot_id') chatbot_id: string,
  ) {
    return await this.fileUploadService.removeCrawledFileFromYandexCloud(
      removeFile,
      chatbot_id,
    );
  }

  @UseGuards(AuthJWTGuard, ChatbotOwnerGuard)
  @Post('remove-file')
  async removeUploadedFile(
    @Body() removeFile: RemoveUploadedFileDto,
    @Query('chatbot_id') chatbot_id: string,
  ) {
    return await this.fileUploadService.removeUploadedFile(
      removeFile,
      chatbot_id,
    );
  }

  @UseGuards(AuthJWTGuard, ChatbotOwnerGuard)
  @Post('source-text-upload')
  async dataSourceUploadText(
    @Body() uploadText: TextUploadDto,
    @Query('chatbot_id') chatbot_id: string,
  ) {
    const { data } = uploadText;
    const char_length = data.length;
    return await this.fileUploadService.uploadTextFromDataSource({
      chatbot_id,
      data,
      char_length,
    });
  }

  @UseGuards(AuthJWTGuard, ChatbotOwnerGuard)
  @Post('single-upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: globalConfig.MAX_FILE_SIZE,
      },
    }),
  )
  async dataSourceUploadFile(
    @UploadedFile() file,
    @Query('chatbot_id') chatbot_id: string,
  ) {
    const fileName = decodeURIComponent(file.originalname);
    const charLength = await this.fileUploadService.getOneFileLength(file);
    await this.fileUploadService.uploadSingleFile(
      {
        fileName,
        chatbot_id,
        data: file.buffer,
        char_length: charLength.textSize,
      },
      CategoryEnum.FILE,
    );
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
    return await this.fileUploadService.getMultipleFileTextLength(files);
  }

  @UseGuards(AuthJWTGuard, ChatbotOwnerGuard)
  @Post('profile-picture-upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: globalConfig.MAX_FILE_SIZE,
      },
    }),
  )
  async imageUpload(
    @UploadedFile() file,

    @Query('chatbot_id') chatbot_id: string,
  ) {
    const fileName = decodeURIComponent(file.originalname);
    await this.fileUploadService.uploadProfilePicture({
      fileName,
      chatbot_id,
      data: file.buffer,
    });
    return ResponseResult.SUCCESS;
  }
}
