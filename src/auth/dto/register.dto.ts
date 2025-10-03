import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsInt, Max, Min } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Max(7)
  studyYear: number;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;
}
