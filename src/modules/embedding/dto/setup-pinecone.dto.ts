import { IsMongoId, IsUUID } from 'class-validator';

export class EmbeddingSetupDto {
  @IsMongoId()
  chatbot_id: string;
}
