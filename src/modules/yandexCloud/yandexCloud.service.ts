import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import {
  CreateBucketCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { yandexCloudClient } from '../../config/aws.config';
import { BUCKET_NAME } from '../../config/aws.config';

@Injectable()
export class YandexCloudService {
  private s3: S3Client;

  constructor() {
    this.s3 = yandexCloudClient;
  }

  async uploadFile(user_id: string, fileName: string, data: Buffer) {
    const params = {
      Bucket: BUCKET_NAME, // The name of the bucket. For example, 'sample-bucket-101'.
      Key: `${user_id}/${fileName}`, // The name of the object. For example, 'sample_upload.txt'.
      Body: 'test ', // fs.readFileSync('<path_to_your_file>') The content of the object. For example, 'Hello world!'.
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

  async retrieve(user_id: string, fileName: string) {
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
    };
    const command = new GetObjectCommand(params);

    const { Body } = await this.s3.send(command);
    console.log(await Body.transformToString('utf-8'));
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
