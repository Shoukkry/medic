import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findById(id: string) {
    const user = await this.userModel.findById(id).select('-passwordHash');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string) {
    const normalized = email.trim().toLowerCase();
    return this.userModel.findOne({ email: normalized }).select('-passwordHash');
  }

  async updateProfile(id: string, dto: UpdateUserDto) {
    if (dto.username) {
      const exists = await this.userModel.findOne({
        username: dto.username,
        _id: { $ne: id },
      });
      if (exists) throw new ConflictException('Username already taken');
    }
    const updated = await this.userModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .select('-passwordHash');
    return updated;
  }

  async setSubscription(userId: string, paymentDate: Date, months = 1) {
    const start = paymentDate;
    const end = new Date(start);
    end.setMonth(end.getMonth() + months);

    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          'subscription.paymentDate': start,
          'subscription.endDate': end,
          'subscription.status': 'active',
        },
        { new: true },
      )
      .select('-passwordHash');
    return user;
  }

  async findByPhone(phone: string) {
    return this.userModel.findOne({ phone }).select('-passwordHash');
  }

  async searchUsers(term: string, limit = 10) {
    if (!term || !term.trim()) return [];
    const sanitized = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(sanitized, 'i');
    return this.userModel
      .find({
        $or: [
          { username: regex },
          { email: regex },
          { firstName: regex },
          { lastName: regex },
        ],
      })
      .limit(Math.min(Math.max(limit, 1), 25))
      .select('username firstName lastName email')
      .lean();
  }

  async createByPhone(phone: string) {
    const digits = (phone ?? '').replace(/\D/g, '');
    const fallback = Math.floor(1000 + Math.random() * 9000).toString();
    const suffix = digits.slice(-4) || fallback;
    const username = await this.generateUniqueUsername(`user_${suffix}`);

    const user = new this.userModel({
      phone,
      username,
      authProvider: ['phone'],
      isVerified: true,
      verifiedAt: new Date(),
    });
    await user.save();
    return user;
  }

  async createByGoogle(email: string, firstName?: string, lastName?: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const base = normalizedEmail.split('@')[0];
    const username = await this.generateUniqueUsername(base);
    const user = new this.userModel({
      email: normalizedEmail,
      username,
      firstName,
      lastName,
      isVerified: true,
      verifiedAt: new Date(),
      authProvider: ['google'],
    });
    await user.save();
    return user;
  }

  async linkGoogleAccount(userId: string) {
    // si l'utilisateur avait déjà un compte email/phone, on ajoute 'google' comme provider
    return this.userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { authProvider: 'google' } },
      { new: true },
    );
  }

  private async generateUniqueUsername(base: string) {
    const safeBase =
      base && base.trim().length > 0 ? base.trim() : `user_${Date.now()}`;
    let candidate = safeBase;
    let suffix = 0;
    // Loop with small bound to avoid infinite in extreme cases
    while (await this.userModel.exists({ username: candidate })) {
      suffix += 1;
      candidate = `${safeBase}${suffix}`;
    }
    return candidate;
  }

  async updateStatsAfterAttempt(
    userId: string,
    payload: {
      score?: number;
      correct?: number;
      wrong?: number;
      skipped?: number;
      timeSpent?: number;
    },
  ) {
    const user = await this.userModel.findById(userId).select('stats');
    if (!user) return null;

    const score = payload.score ?? 0;
    const correct = payload.correct ?? 0;
    const wrong = payload.wrong ?? 0;
    const skipped = payload.skipped ?? 0;
    const timeSpent = payload.timeSpent ?? 0;

    const update: any = {
      $inc: {
        'stats.qcmAttempts': 1,
        'stats.totalScore': score,
        'stats.totalCorrect': correct,
        'stats.totalWrong': wrong,
        'stats.totalSkipped': skipped,
        'stats.totalTimeSpent': timeSpent,
      },
      $set: {
        'stats.lastScore': score,
        'stats.lastActivityAt': new Date(),
      },
    };

    const currentBest = user.stats?.bestScore ?? null;
    if (currentBest === null || (score ?? 0) > currentBest) {
      update.$set['stats.bestScore'] = score;
    }

    const updated = await this.userModel
      .findByIdAndUpdate(userId, update, { new: true })
      .select('-passwordHash');

    return updated?.stats ?? null;
  }
}
