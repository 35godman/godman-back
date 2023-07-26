import { Injectable, UploadedFiles } from '@nestjs/common';
import { YandexCloudService } from '../yandexCloud/yandexCloud.service';
import { FileUploadDto } from './dto/file-upload.dto';
import { Model } from 'mongoose';
import { FileUpload, FileUploadDocument } from './fileUpload.schema';
import { ChatbotService } from '../chatbot/chatbot.service';
import { InjectModel } from '@nestjs/mongoose';
import { stringToASCII } from '../../helpers/stringToASCII';
import { convertFilenameToUtf8 } from '../../helpers/convertFileNameToUtf8';
import { writeFileSync } from 'fs';
import { rmdirSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, resolve } from 'path';
import { RemoveWebCrawledFileDto } from './dto/RemoveWebCrawledFile.dto';
import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import * as fs from 'fs';
@Injectable()
export class FileUploadService {
  constructor(
    private yandexCloudService: YandexCloudService,
    @InjectModel(FileUpload.name)
    private fileUploadModel: Model<FileUploadDocument>,
    private chatbotService: ChatbotService,
  ) {}

  async uploadSingleFile(payload: FileUploadDto) {
    const { fileName, data, chatbot_id } = payload;

    const updatedFileName = fileName;

    const newFile = new this.fileUploadModel({
      storagePath: chatbot_id,
      originalName: updatedFileName,
    });

    await this.chatbotService.addSourceFile(chatbot_id, newFile);

    await this.yandexCloudService.uploadFile(chatbot_id, updatedFileName, data);
  }

  async removeFileFromYandexCloud(payload: RemoveWebCrawledFileDto) {
    const { web_link, chatbot_id } = payload;
    return await this.yandexCloudService.removeWebCrawledFile(
      chatbot_id,
      web_link,
    );
  }

  async deleteChatbotDirectory(directory: string) {
    const resolvedDir = resolve(`docs/${directory}`);
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
  }

  async getFileTextLength(files: Express.Multer.File[]) {
    const fileSize = [];
    for (const file of files) {
      file.originalname = decodeURIComponent(file.originalname);
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
          const text = data.toString();
          fileSize.push({
            textSize: text.length,
            name: file.originalname,
          });
      }
    }
    return fileSize;
  }
}
