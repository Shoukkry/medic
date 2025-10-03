import {
  IsArray,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCoursDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nom: string;

  @IsInt()
  @Min(1900)
  qcmyear: number;

  @IsMongoId()
  module: string;

  @IsOptional()
  @IsArray()
  @Type(() => String)
  @IsString({ each: true })
  pdfs?: string[];
}
