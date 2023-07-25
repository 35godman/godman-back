import { IsMongoId, IsString } from 'class-validator';

export class CreateDefaultChatbotDto {
  @IsMongoId()
  user_id: string;
}
