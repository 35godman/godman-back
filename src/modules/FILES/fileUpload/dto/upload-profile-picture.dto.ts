import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class UploadProfilePictureDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;
  @IsMongoId()
  chatbot_id: string;
  @IsNotEmpty()
  data: Buffer;
}
