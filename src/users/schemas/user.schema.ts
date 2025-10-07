import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SPECIALITIES, Speciality } from '../../common/specialities';

export type UserDocument = User & Document;

export type AuthProvider = 'email' | 'google' | 'phone';

export type UserRole = 'user' | 'admin';

@Schema({ timestamps: true })
export class Subscription {
  @Prop() paymentDate?: Date;
  @Prop() endDate?: Date;
  @Prop({ default: 'expired' }) status?: 'active' | 'expired' | 'pending';
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

@Schema()
export class Stats {
  @Prop({ default: null }) lastScore?: number;
  @Prop({ default: null }) bestScore?: number;
  @Prop({ default: 0 }) qcmAttempts?: number;
  @Prop({ default: null }) lastLogin?: Date;
  @Prop({ default: 0 }) totalScore?: number;
  @Prop({ default: 0 }) totalCorrect?: number;
  @Prop({ default: 0 }) totalWrong?: number;
  @Prop({ default: 0 }) totalSkipped?: number;
  @Prop({ default: 0 }) totalTimeSpent?: number;
  @Prop({ default: null }) lastActivityAt?: Date;
}

export const StatsSchema = SchemaFactory.createForClass(Stats);

@Schema()
export class Favorites {
  @Prop({ type: [Types.ObjectId], default: [] }) questions: Types.ObjectId[];
}

export const FavoritesSchema = SchemaFactory.createForClass(Favorites);

@Schema({ collection: 'users' })
export class User {
  @Prop({ required: true, unique: true }) username: string;

  @Prop({ unique: true, sparse: true }) email?: string;
  @Prop() passwordHash?: string;

  @Prop({ default: false })
  isVerified?: boolean;

  @Prop({ unique: true, sparse: true }) phone?: string; // <-- ajout du champ phone

  @Prop() firstName?: string;
  @Prop() lastName?: string;
  @Prop({ default: null }) studyYear?: number;

  @Prop({ type: String, enum: SPECIALITIES, default: null })
  speciality?: Speciality;

  @Prop({
    type: [String],
    enum: ['email', 'google', 'phone'],
    default: ['email'],
  })
  authProvider: AuthProvider[];

  @Prop({ type: String, enum: ['user', 'admin'], default: 'user' })
  role: UserRole;

  @Prop({ type: SubscriptionSchema, default: {} })
  subscription?: Subscription;

  @Prop({ type: FavoritesSchema, default: {} })
  favorites?: Favorites;

  @Prop({ type: StatsSchema, default: {} })
  stats?: Stats;

  @Prop({ default: Date.now }) createdAt?: Date;
  @Prop() updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
