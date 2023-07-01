import { S3Client } from '@aws-sdk/client-s3';
import { fromIni } from '@aws-sdk/credential-provider-ini';

import { PutObjectCommand, CreateBucketCommand } from '@aws-sdk/client-s3';
// Установка региона Object Storage
const REGION = 'ru-central1';
// Установка эндпоинта Object Storage
const ENDPOINT = 'https://storage.yandexcloud.net';
// export { s3Client };
const params = {
  Bucket: 'test-godman', // The name of the bucket. For example, 'sample-bucket-101'.
  Key: 'test.txt', // The name of the object. For example, 'sample_upload.txt'.
  Body: 'test ', // fs.readFileSync('<path_to_your_file>') The content of the object. For example, 'Hello world!'.
};

// Create an Object Storage client
const s3Client = new S3Client({
  region: REGION,
  endpoint: ENDPOINT,
  credentials: fromIni({ profile: 'yandex' }),
});

const run = async () => {
  // Создание бакета
  try {
    const data = await s3Client.send(
      new CreateBucketCommand({ Bucket: params.Bucket }),
    );
    console.log(data);
    console.log('Successfully created a bucket called ', data.Location);
    return data; // Для модульного тестирования.
  } catch (err) {
    console.log('Error', err);
  }
  // Создание объекта и загрузка его в бакет
  try {
    const results = await s3Client.send(new PutObjectCommand(params));
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
};
run();
