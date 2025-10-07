import {
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateCoursDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nom?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  studyYear?: number;

  @IsOptional()
  @IsMongoId()
  module?: string;
}
