import { ObjectId } from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChatbotCreateDto {
  @IsString()
  @IsNotEmpty()
  owner: string;
  // setting_id: ObjectId;
  // sources_id: ObjectId;
}
