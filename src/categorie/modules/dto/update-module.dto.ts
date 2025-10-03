import { IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateModuleDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nom?: string;

  @IsOptional()
  @IsMongoId()
  unite?: string;
}
