import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUniteDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nom?: string;
}
