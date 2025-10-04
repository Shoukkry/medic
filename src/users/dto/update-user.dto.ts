import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { SPECIALITIES, Speciality } from '../../common/specialities';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  studyYear?: number;

  @IsOptional()
  @IsIn(SPECIALITIES)
  speciality?: Speciality;
}
