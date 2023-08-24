import { S3Client } from '@aws-sdk/client-s3';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import * as dotenv from 'dotenv';
dotenv.config();
import { PutObjectCommand, CreateBucketCommand } from '@aws-sdk/client-s3';
// Установка региона Object Storage
const REGION = 'ru-central1';
// Установка эндпоинта Object Storage
const ENDPOINT = 'https://storage.yandexcloud.net';
export const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
export const awsConfig = {
  region: REGION,
  endpoint: ENDPOINT,
  credentials: fromIni({ profile: 'yandex' }),
};
// Create an Object Storage client
export const yandexCloudClient = new S3Client(awsConfig);
