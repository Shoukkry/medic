import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class RegisterAdminDto {
  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;
}
