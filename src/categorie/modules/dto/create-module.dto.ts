import { IsMongoId, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateModuleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nom: string;

  @IsMongoId()
  @IsNotEmpty()
  unite: string;
}
