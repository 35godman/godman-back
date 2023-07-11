import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ValidateObjectIdPipe implements PipeTransform<string> {
  async transform(value: string, metadata: ArgumentMetadata) {
    const isValidObjectId = Types.ObjectId.isValid(value);
    if (!isValidObjectId) {
      throw new BadRequestException('Invalid ID!');
    }
    return value;
  }
}
