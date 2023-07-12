import { Injectable } from '@nestjs/common';
import { YandexCloudService } from '../yandexCloud/yandexCloud.service';
import { FileUploadDto } from './dto/file-upload.dto';
import { Model } from 'mongoose';
import { FileUpload, FileUploadDocument } from './fileUpload.schema';
import { ChatbotService } from '../chatbot/chatbot.service';
import { InjectModel } from '@nestjs/mongoose';
import { stringToASCII } from '../../helpers/stringToASCII';

@Injectable()
export class FileUploadService {
  constructor(
    private yandexCloudService: YandexCloudService,
    @InjectModel(FileUpload.name)
    private fileUploadModel: Model<FileUploadDocument>,
    private chatbotService: ChatbotService,
  ) {}

  async uploadFile(payload: FileUploadDto) {
    const { fileName, data, chatbot_id } = payload;

    const updatedFileName = stringToASCII(fileName);

    const newFile = new this.fileUploadModel({
      storagePath: chatbot_id,
      originalName: updatedFileName,
    });

    await this.chatbotService.addSourceFile(chatbot_id, newFile);

    await this.yandexCloudService.uploadFile(chatbot_id, updatedFileName, data);
  }
}
