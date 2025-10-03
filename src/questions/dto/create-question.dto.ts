import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  questionText: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  options: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(0, { each: true })
  correctAnswer: number[];

  @IsOptional()
  @IsInt()
  @Min(1900)
  year?: number;

  @IsOptional()
  @IsInt()
  @Min(1900)
  qcmYear?: number;

  @IsMongoId()
  unite: string;

  @IsMongoId()
  module: string;

  @IsMongoId()
  cours: string;
}
