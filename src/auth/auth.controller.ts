import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  Get,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.registerLocal(dto);
  }

  @Post('admin/register')
  async registerAdmin(@Body() dto: RegisterAdminDto) {
    return this.authService.registerAdmin(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUserByEmail(
      dto.email,
      dto.password,
    );
    return this.authService.loginLocal(user);
  }

  @Post('admin/login')
  async adminLogin(@Body() dto: LoginDto) {
    return this.authService.loginAdmin(dto.email, dto.password);
  }

  @Post('google/token')
  async googleTokenLogin(@Body('id_token') idToken: string) {
    if (!idToken) {
      throw new BadRequestException('id_token manquant');
    }

    const userData = await this.authService.verifyGoogleToken(idToken);

    // Ici tu crées/retrouves ton user en BDD
    return userData;
  }

  // phone: POST /auth/phone { phone } -> send OTP
  // phone verify: POST /auth/phone/verify { phone, code } -> verify & return JWT
  @Post('phone')
  async phone(@Body('phone') phone: string) {
    return this.authService.loginWithPhone(phone);
  }

  @Post('phone/verify')
  async verifyPhone(@Body('phone') phone: string, @Body('code') code: string) {
    return this.authService.loginWithPhone(phone, code);
  }
}
