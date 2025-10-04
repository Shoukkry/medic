import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Friendship, FriendshipDocument } from './schemas/friendship.schema';
import { UsersService } from '../users/users.service';
import { RespondFriendRequestDto } from './dto/respond-friend-request.dto';

@Injectable()
export class FriendsService {
  constructor(
    @InjectModel(Friendship.name)
    private readonly friendshipModel: Model<FriendshipDocument>,
    private readonly usersService: UsersService,
  ) {}

  private toObjectId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Identifiant invalide');
    }
    return new Types.ObjectId(id);
  }

  async sendFriendRequest(requesterId: string, recipientId: string) {
    if (requesterId === recipientId) {
      throw new BadRequestException('Impossible de vous ajouter vous-même');
    }

    await this.usersService.findById(recipientId); // throws si absent

    const requester = this.toObjectId(requesterId);
    const recipient = this.toObjectId(recipientId);

    const existing = await this.friendshipModel.findOne({
      $or: [
        { requester, recipient },
        { requester: recipient, recipient: requester },
      ],
    });

    if (existing) {
      if (existing.status === 'accepted') {
        throw new ConflictException('Vous êtes déjà amis.');
      }

      if (
        existing.requester.equals(requester) &&
        existing.status === 'pending'
      ) {
        throw new ConflictException('Invitation déjà envoyée.');
      }

      if (
        existing.requester.equals(recipient) &&
        existing.status === 'pending'
      ) {
        existing.status = 'accepted';
        existing.respondedAt = new Date();
        await existing.save();
        return existing;
      }

      if (existing.status === 'declined') {
        existing.requester = requester;
        existing.recipient = recipient;
        existing.status = 'pending';
        existing.respondedAt = undefined;
        await existing.save();
        return existing;
      }
    }

    const friendship = await this.friendshipModel.create({
      requester,
      recipient,
    });
    return friendship;
  }

  async listFriendships(
    userId: string,
    status?: 'pending' | 'accepted' | 'declined',
  ) {
    const userObjectId = this.toObjectId(userId);
    const filter: any = {
      $or: [{ requester: userObjectId }, { recipient: userObjectId }],
    };
    if (status) {
      filter.status = status;
    }

    return this.friendshipModel
      .find(filter)
      .populate('requester', 'username firstName lastName email')
      .populate('recipient', 'username firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();
  }

  async listPendingIncoming(userId: string) {
    const recipient = this.toObjectId(userId);
    return this.friendshipModel
      .find({ recipient, status: 'pending' })
      .populate('requester', 'username firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();
  }

  async respondToRequest(
    userId: string,
    friendshipId: string,
    dto: RespondFriendRequestDto,
  ) {
    const friendship = await this.friendshipModel.findById(friendshipId);
    if (!friendship) {
      throw new NotFoundException('Invitation introuvable');
    }

    const userObjectId = this.toObjectId(userId);

    if (!friendship.recipient.equals(userObjectId)) {
      throw new BadRequestException(
        'Vous ne pouvez pas agir sur cette invitation',
      );
    }

    if (friendship.status !== 'pending') {
      throw new ConflictException('Invitation déjà traitée');
    }

    friendship.status = dto.action === 'accept' ? 'accepted' : 'declined';
    friendship.respondedAt = new Date();
    await friendship.save();
    return friendship;
  }

  async removeFriend(userId: string, otherUserId: string) {
    const userObjectId = this.toObjectId(userId);
    const otherObjectId = this.toObjectId(otherUserId);

    const friendship = await this.friendshipModel.findOne({
      $or: [
        { requester: userObjectId, recipient: otherObjectId },
        { requester: otherObjectId, recipient: userObjectId },
      ],
      status: 'accepted',
    });

    if (!friendship) {
      throw new NotFoundException('Relation introuvable');
    }

    await friendship.deleteOne();
    return { success: true };
  }
}
