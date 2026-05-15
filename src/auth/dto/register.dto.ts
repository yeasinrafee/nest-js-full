import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Name can not be empty' })
  @IsString()
  @MinLength(2, { message: 'Name must be minimum 2 character length' })
  name!: string;

  @IsNotEmpty({ message: 'Email can not be empty' })
  @IsEmail()
  email!: string;

  @IsNotEmpty({ message: 'Password can not be empty' })
  @MinLength(6, { message: 'Password must be 6 character length' })
  password!: string;
}
