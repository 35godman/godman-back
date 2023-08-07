import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { yandexCloudClient } from '../../../config/aws.config';
import { BUCKET_NAME } from '../../../config/aws.config';
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';
import * as stream from 'stream';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class YandexCloudService {
  private s3: S3Client;

  constructor() {
    this.s3 = yandexCloudClient;
  }

  async uploadFile(
    chatbot_id: string,
    fileName: string,
    data: Buffer | string,
  ) {
    const params = {
      Bucket: BUCKET_NAME, // The name of the bucket. For example, 'sample-bucket-101'.
      Key: `${chatbot_id}/${fileName}`, // The name of the object. For example, 'sample_upload.txt'.
      Body: data, // fs.readFileSync('<path_to_your_file>') The content of the object. For example, 'Hello world!'.
    };

    // Создание объекта и загрузка его в бакет
    try {
      const results = await this.s3.send(new PutObjectCommand(params));
      console.log(
        'Successfully created ' +
          params.Key +
          ' and uploaded it to ' +
          params.Bucket +
          '/' +
          params.Key,
      );
      return results; // Для модульного тестирования.
    } catch (err) {
      console.log('Error', err);
    }
  }

  async downloadFiles(chatbot_id) {
    const params = {
      Bucket: BUCKET_NAME,
      Prefix: `${chatbot_id}/`,
    };
    const pipelineAsync = promisify(pipeline);

    const command = new ListObjectsV2Command(params);
    const data = await this.s3.send(command);

    if (data.Contents.length) {
      for (const file of data.Contents) {
        const fileExtension = path.extname(file.Key);
        if (
          fileExtension === '.txt' ||
          fileExtension === '.docx' ||
          fileExtension === '.md' ||
          fileExtension === '.pdf'
        ) {
          const getParams = {
            Bucket: BUCKET_NAME,
            Key: file.Key,
          };

          const getCommand = new GetObjectCommand(getParams);
          const result = await this.s3.send(getCommand);

          const fileStream = result.Body as unknown as stream.Readable;
          // Ensure directory exists
          const directoryPath = path.join('docs', `${chatbot_id}`);
          fs.mkdirSync(directoryPath, { recursive: true });
          const ext = file.Key.split('.').pop();
          const localFilePath = path.join(
            directoryPath,
            path.basename(uuidv4() + `.${ext}`),
          );

          const writeStream = fs.createWriteStream(localFilePath);

          if (fileStream && fileStream.pipe) {
            await pipelineAsync(fileStream, writeStream);
            console.log(`File downloaded to ${localFilePath}`);
          } else {
            console.error('Unable to handle the stream type.');
          }
        }
      }
    }
  }
  async removeWebCrawledFile(chatbot_id, web_link: string): Promise<string> {
    const urlWithoutSlashes = web_link.replace(/\//g, '[]');
    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: `${chatbot_id}/${urlWithoutSlashes}`,
    };

    const deleteCommand = new DeleteObjectCommand(deleteParams);
    try {
      await this.s3.send(deleteCommand);
      return `${web_link} successfully deleted`;
    } catch (e) {
      return e.message;
    }
  }

  async removeUploadedFile(chatbot_id, file_name: string): Promise<string> {
    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: `${chatbot_id}/${file_name}`,
    };
    console.log(
      '=>(yandexCloud.service.ts:124) `${chatbot_id}/${file_name}`',
      `${chatbot_id}/${file_name}`,
    );

    const deleteCommand = new DeleteObjectCommand(deleteParams);
    try {
      await this.s3.send(deleteCommand);
      return `${file_name} successfully deleted`;
    } catch (e) {
      return e.message;
    }
  }

  async createBucket() {
    // // Создание бакета
    // try {
    //   const data = await this.s3.send(
    //     new CreateBucketCommand({ Bucket: params.Bucket }),
    //   );
    //   console.log(data);
    //   console.log('Successfully created a bucket called ', data.Location);
    //   return data; // Для модульного тестирования.
    // } catch (err) {
    //   console.log('Error', err);
    // }
  }
}
