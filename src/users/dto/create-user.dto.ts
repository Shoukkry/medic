// src/users/dto/create-user.dto.ts
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsNotEmpty,
  IsIn,
} from 'class-validator';
import { SPECIALITIES, Speciality } from '../../common/specialities';

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

  @IsOptional()
  @IsIn(SPECIALITIES)
  speciality?: Speciality;
}
