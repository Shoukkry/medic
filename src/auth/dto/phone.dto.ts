import { IsString } from 'class-validator';

export class PhoneDto {
  @IsString()
  phone: string;

  @IsString()
  otp: string; // code envoyé par SMS
}
