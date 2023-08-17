import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UploadedFiles,
} from '@nestjs/common';
import { YandexCloudService } from '../yandexCloud/yandexCloud.service';
import { FileUploadDto } from './dto/file-upload.dto';
import { Model } from 'mongoose';
import { FileUpload, FileUploadDocument } from './fileUpload.schema';
import { ChatbotService } from '../../chatbot/chatbot.service';
import { InjectModel } from '@nestjs/mongoose';
import { stringToASCII } from '../../../helpers/stringToASCII';
import { convertFilenameToUtf8 } from '../../../helpers/convertFileNameToUtf8';
import { writeFileSync } from 'fs';
import { rmdirSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, resolve } from 'path';
import { RemoveWebCrawledFileDto } from './dto/RemoveWebCrawledFile.dto';
import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import * as fs from 'fs';
import { CategoryEnum } from '../../../enum/category.enum';
import { SourcesService } from '../../chatbot/sources/sources.service';
import { ChatbotSourcesDocument } from '../../chatbot/schemas/chatbotSources.schema';
import { UploadTextFromDataSourceDto } from './dto/text-upload.dto';
import { RemoveUploadedFileDto } from './dto/RemoveUploadedFile.dto';
import { UpdateQnADto } from './dto/add-qna.dto';
import { SettingsService } from '../../chatbot/settings/settings.service';
import { UploadProfilePictureDto } from './dto/upload-profile-picture.dto';
@Injectable()
export class FileUploadService {
  constructor(
    @Inject(forwardRef(() => SourcesService))
    private chatbotSourcesService: SourcesService,
    private chatbotSettingsService: SettingsService,
    @InjectModel(FileUpload.name)
    private fileUploadModel: Model<FileUpload>,
    private yandexCloudService: YandexCloudService,
  ) {}

  async uploadSingleFile(
    payload: FileUploadDto,
    category: CategoryEnum.FILE | CategoryEnum.WEB,
  ): Promise<FileUploadDocument> {
    const { fileName, data, chatbot_id, char_length } = payload;

    await this.chatbotSettingsService.increaseCharNum(chatbot_id, char_length);

    const newFile = new this.fileUploadModel({
      chatbot: chatbot_id,
      storagePath: chatbot_id,
      originalName: fileName,
      char_length,
    });

    const newSource = await this.chatbotSourcesService.addSourceFile(
      chatbot_id,
      newFile,
      category,
    );

    await this.yandexCloudService.uploadFile(chatbot_id, fileName, data);
    return newSource;
  }

  async uploadTextFromDataSource(payload: UploadTextFromDataSourceDto) {
    const { char_length, chatbot_id, data } = payload;

    const sources = await this.chatbotSourcesService.findByChatbotId(
      chatbot_id,
    );

    await this.chatbotSettingsService.increaseCharNum(
      chatbot_id,
      //here we define the new char_length
      char_length - sources.text.length,
    );
    sources.text = data;
    await sources.save();
    return await this.yandexCloudService.uploadFile(
      chatbot_id,
      process.env.TEXT_DATASOURCE_NAME,
      data,
    );
  }

  async removeCrawledFileFromYandexCloud(
    payload: RemoveWebCrawledFileDto,
    chatbot_id,
  ) {
    const { web_link, weblink_id } = payload;

    const sources = await this.chatbotSourcesService.findByChatbotId(
      chatbot_id,
    );

    const sourceFileIndex = sources.website.findIndex(
      (item) => item._id.toString() === weblink_id,
    );
    if (sourceFileIndex > -1) {
      await this.chatbotSettingsService.decreaseCharNum(
        chatbot_id,
        sources.website[sourceFileIndex].char_length,
      );
      sources.website.splice(sourceFileIndex, 1);

      await sources.updateOne({ $set: { website: sources.website } });
    } else {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }

    return await this.yandexCloudService.removeWebCrawledFile(
      chatbot_id,
      web_link,
    );
  }

  async deleteChatbotDirectory(directory: string) {
    const resolvedDir = resolve(`docs/${directory}`);

    try {
      const files = readdirSync(resolvedDir);
      for (const file of files) {
        const filePath = join(resolvedDir, file);

        if (statSync(filePath).isDirectory()) {
          await this.deleteChatbotDirectory(filePath); // Recurse if the file is a directory
        } else {
          unlinkSync(filePath); // Remove the file
        }
      }

      rmdirSync(resolvedDir); // Remove the directory itself
    } catch (e) {
      console.log('no such directory');
    }
  }

  async getMultipleFileTextLength(files: Express.Multer.File[]) {
    const fileSize = [];
    for (const file of files) {
      fileSize.push(await this.getOneFileLength(file));
    }
    return fileSize;
  }

  async getOneFileLength(file: Express.Multer.File) {
    const fileSize = {
      textSize: 0,
      name: file.originalname,
    };
    file.originalname = decodeURIComponent(file.originalname);
    const fileNameExtension = file.originalname.split('.').pop().toLowerCase();
    const data = file.buffer;
    switch (fileNameExtension) {
      case 'pdf':
        const textSize = await pdfParse(data);
        fileSize.textSize = textSize.length;
        if (!textSize) {
          throw new HttpException('Pdf corrupted', HttpStatus.BAD_REQUEST);
        }
        fileSize.name = file.originalname;
        break;
      case 'docx':
        const { value } = await mammoth.extractRawText({ buffer: data });
        fileSize.textSize = value.length;
        fileSize.name = file.originalname;
        break;
      case 'txt':
        const text = data.toString();
        fileSize.textSize = text.length;
        fileSize.name = file.originalname;
    }
    return fileSize;
  }

  async removeUploadedFile(payload: RemoveUploadedFileDto, chatbot_id: string) {
    const { file_id, original_name } = payload;
    const sources = await this.chatbotSourcesService.findByChatbotId(
      chatbot_id,
    );

    const sourceFileIndex = sources.files.findIndex(
      (item) => item._id.toString() === file_id,
    );

    if (sourceFileIndex > -1) {
      await this.chatbotSettingsService.decreaseCharNum(
        chatbot_id,
        sources.files[sourceFileIndex].char_length,
      );
      sources.files.splice(sourceFileIndex, 1);

      await sources.save();
    } else {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }
    return await this.yandexCloudService.removeUploadedFile(
      chatbot_id,
      decodeURIComponent(original_name),
    );
  }

  async uploadProfilePicture(payload: UploadProfilePictureDto) {
    const { chatbot_id, data } = payload;
    const settingsEntity = await this.chatbotSettingsService.findByChatbotId(
      chatbot_id,
    );
    settingsEntity.profile_picture_path =
      'data:image/jpeg;base64,' + data.toString('base64');
    // await this.yandexCloudService.uploadFile(chatbot_id, fileName, data);
    await settingsEntity.save();
  }
}
