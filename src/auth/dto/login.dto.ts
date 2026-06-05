import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Email can not be empty' })
  @IsEmail()
  email!: string;

  @IsNotEmpty({ message: 'Password can not be empty' })
  @MinLength(6, { message: 'Password must be 6 character length' })
  password!: string;
}
