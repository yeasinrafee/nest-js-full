/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class CapitalizePipe implements PipeTransform {
  transform(value: string) {
    if (!value || typeof value !== 'string') return value;

    return value
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase + word.slice(1))
      .join(' ');
  }
}
