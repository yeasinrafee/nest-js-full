import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParsePositiveIntPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const num = parseInt(value, 10);

    if (isNaN(num)) {
      throw new BadRequestException(`${metadata.data} must be a number`);
    }

    if (num <= 0) {
      throw new BadRequestException(`${metadata.data} must be positive number`);
    }

    return num;
  }
}
