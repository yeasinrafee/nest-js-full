/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must be at most 50 characters long' })
  name!: string;

  @IsNotEmpty({ message: 'email is required' })
  @IsEmail({}, { message: 'email must be a valid email address' })
  email!: string;

  @IsOptional()
  @IsInt({ message: 'age must be an integer' })
  @Min(1, { message: 'Age must be at least 1' })
  @Max(120, { message: 'Age must be at most 120' })
  age?: number;
}
