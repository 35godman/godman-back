import { Injectable } from '@nestjs/common';
import { YandexCloudService } from '../yandexCloud/yandexCloud.service';
import { FileUploadDto } from './dto/file-upload.dto';

@Injectable()
export class FileUploadService {
  constructor(private yandexCloudService: YandexCloudService) {}

  async uploadFile(payload: FileUploadDto) {
    const { user_id, fileName, data } = payload;

    await this.yandexCloudService.uploadFile(user_id, fileName, data);
  }
}
