import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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
    return this.userModel.findOne({ email }).select('-passwordHash');
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

  async createByPhone(phone: string) {
    const username = await this.generateUniqueUsername(`user_${phone.slice(-4)}`);
    const user = new this.userModel({
      phone,
      username,
      authProvider: ['phone'],
      isVerified: true,
    });
    await user.save();
    return user;
  }

  async createByGoogle(email: string, firstName?: string, lastName?: string) {
    const base = email.split('@')[0];
    const username = await this.generateUniqueUsername(base);
    const user = new this.userModel({
      email,
      username,
      firstName,
      lastName,
      isVerified: true,
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
    let candidate = base;
    let suffix = 0;
    // Loop with small bound to avoid infinite in extreme cases
    while (await this.userModel.exists({ username: candidate })) {
      suffix += 1;
      candidate = `${base}${suffix}`;
    }
    return candidate;
  }
}
