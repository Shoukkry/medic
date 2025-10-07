import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { RegisterDto } from './dto/register.dto';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OtpService } from '../otp/otp.service';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private otpService: OtpService,
    private usersService: UsersService,
  ) {}

  async registerLocal(dto: RegisterDto) {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      studyYear,
      speciality,
    } = dto;

    const existed = await this.userModel
      .findOne({ $or: [{ username }, { email }] })
      .lean();
    if (existed)
      throw new BadRequestException('Username or email already used');

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);

    const created = await this.userModel.create({
      username,
      email,
      passwordHash: hash,
      firstName,
      lastName,
      studyYear,
      speciality,
      authProvider: ['email'],
      role: 'user',
    } as any);

    // created._id est un ObjectId -> safe to toString
    return this.signUser(created as any);
  }

  async registerAdmin(dto: RegisterAdminDto) {
    const setupToken = this.configService.get<string>('ADMIN_SETUP_TOKEN');
    if (!setupToken) {
      throw new BadRequestException('Création administrateur désactivée.');
    }
    const { token: providedToken, password, ...rest } = dto;
    if (providedToken !== setupToken) {
      throw new UnauthorizedException("Jeton d'initialisation invalide");
    }

    const existed = await this.userModel
      .findOne({ $or: [{ username: rest.username }, { email: rest.email }] })
      .lean();
    if (existed) {
      throw new BadRequestException('Username or email already used');
    }

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);

    const created = await this.userModel.create({
      ...rest,
      passwordHash: hash,
      authProvider: ['email'],
      role: 'admin',
      isVerified: true,
    } as any);

    return this.signUser(created as any);
  }

  async validateUserByEmail(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user || !user.passwordHash)
      throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async loginLocal(user: UserDocument) {
    return this.signUser(user);
  }

  async loginAdmin(email: string, password: string) {
    const user = await this.validateUserByEmail(email, password);
    if (user.role !== 'admin') {
      throw new UnauthorizedException('Admin privileges required');
    }
    return this.signUser(user);
  }

  signUser(user: UserDocument | any) {
    const id = user._id ? String(user._id) : undefined;

    const payload = {
      sub: id,
      email: user.email ?? null,
      provider: user.authProvider ?? null,
      role: user.role ?? 'user',
    };
    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      user: {
        id,
        username: user.username ?? null,
        email: user.email ?? null,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        studyYear: user.studyYear ?? null,
        speciality: user.speciality ?? null,
        authProvider: Array.isArray(user.authProvider) ? user.authProvider : [],
        role: user.role ?? 'user',
      },
    };
  }

  // Google token-based login (frontend sends id_token)
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  async verifyGoogleToken(idToken: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) throw new UnauthorizedException('Invalid Google token');

      const email = payload.email; // string garanti
      const firstName = payload.given_name || '';
      const lastName = payload.family_name || '';
      const googleId = payload.sub;

      // Vérifier ou créer l’utilisateur

      if (!email) {
        throw new UnauthorizedException('We can not find your Google acount ');
      }

      let user = await this.usersService.findByEmail(email);
      if (!user) {
        user = await this.usersService.createByGoogle(
          email,
          firstName,
          lastName,
        );
      }

      return this.signUser(user as any);
    } catch (err) {
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  // Phone OTP flow: (1) send OTP (no code), (2) verify with code -> sign in / create
  async loginWithPhone(phone: string, code?: string) {
    if (!code) {
      // 1️⃣ Envoi OTP
      return this.otpService.sendOtp(phone);
    }

    // 2️⃣ Vérification OTP
    const valid = this.otpService.verifyOtp(phone, code);
    if (!valid) throw new BadRequestException('OTP invalide ou expiré');

    // 3️⃣ Trouver ou créer l'utilisateur
    let user = await this.usersService.findByPhone(phone);
    if (!user) {
      user = await this.usersService.createByPhone(phone);
    }

    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    const freshUser = await this.userModel
      .findById(user._id)
      .select('-passwordHash')
      .lean();

    const payload = { sub: user._id, phone: user.phone };
    const authProviders =
      Array.isArray(freshUser?.authProvider) &&
      freshUser.authProvider.length > 0
        ? freshUser.authProvider
        : ['phone'];

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: String(user._id),
        username: freshUser?.username ?? user.username,
        phone: freshUser?.phone ?? user.phone ?? null,
        email: freshUser?.email ?? user.email ?? null,
        firstName: freshUser?.firstName ?? user.firstName ?? null,
        lastName: freshUser?.lastName ?? user.lastName ?? null,
        studyYear: freshUser?.studyYear ?? user.studyYear ?? null,
        speciality: freshUser?.speciality ?? user.speciality ?? null,
        authProvider: authProviders,
        role: freshUser?.role ?? user.role ?? 'user',
      },
    };
  }
}
