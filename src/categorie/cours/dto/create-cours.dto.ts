import {
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCoursDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nom: string;

  @IsInt()
  @Min(1)
  @Max(7)
  studyYear: number;

  @IsMongoId()
  module: string;
}
