import {
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
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
  @Min(1900)
  qcmyear?: number;

  @IsOptional()
  @IsMongoId()
  module?: string;
}
