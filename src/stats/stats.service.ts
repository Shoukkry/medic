import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateQcmAttemptDto } from './dto/create-qcm-attempt.dto';
import { QcmAttempt, QcmAttemptDocument } from './schemas/qcm-attempt.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(QcmAttempt.name)
    private readonly attemptModel: Model<QcmAttemptDocument>,
    private readonly usersService: UsersService,
  ) {}

  async recordAttempt(userId: string, dto: CreateQcmAttemptDto) {
    const percentage =
      dto.percentage ?? (dto.total > 0 ? (dto.score / dto.total) * 100 : 0);
    const attemptDoc = await this.attemptModel.create({
      user: userId,
      ...dto,
      percentage: Number(percentage.toFixed(2)),
    });
    const attempt = attemptDoc.toObject();

    const stats = await this.usersService.updateStatsAfterAttempt(userId, {
      score: dto.score,
      correct: dto.correct,
      wrong: dto.wrong,
      skipped: dto.skipped,
      timeSpent: dto.timeSpent,
    });

    return { attempt, stats };
  }

  async getRecentAttempts(userId: string, limit = 20) {
    return this.attemptModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async getSummary(userId: string) {
    const [user, attemptsCount] = await Promise.all([
      this.usersService.findById(userId),
      this.attemptModel.countDocuments({ user: userId }),
    ]);

    const stats = user?.stats ?? null;

    return {
      attemptsCount,
      stats: {
        lastScore: stats?.lastScore ?? null,
        bestScore: stats?.bestScore ?? null,
        qcmAttempts: stats?.qcmAttempts ?? attemptsCount,
        totalScore: stats?.totalScore ?? 0,
        totalCorrect: stats?.totalCorrect ?? 0,
        totalWrong: stats?.totalWrong ?? 0,
        totalSkipped: stats?.totalSkipped ?? 0,
        totalTimeSpent: stats?.totalTimeSpent ?? 0,
        lastActivityAt: stats?.lastActivityAt ?? null,
      },
    };
  }
}
