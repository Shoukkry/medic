// src/users/dto/create-user.dto.ts
import { IsEmail, IsOptional, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;


  @IsNotEmpty()
  studyYear: number;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  passwordHash?: string; 

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}
