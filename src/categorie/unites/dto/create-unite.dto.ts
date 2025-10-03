import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateUniteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nom: string;
}
