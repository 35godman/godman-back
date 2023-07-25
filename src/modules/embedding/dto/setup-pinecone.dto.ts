import { IsUUID } from 'class-validator';

export class EmbeddingSetupDto {
  @IsUUID()
  chatbot_id: string;
}
