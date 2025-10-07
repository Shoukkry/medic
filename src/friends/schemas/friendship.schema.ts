import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type FriendshipStatus = 'pending' | 'accepted' | 'declined';

@Schema({ timestamps: true })
export class Friendship {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  requester: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  recipient: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
  })
  status: FriendshipStatus;

  @Prop({ type: Date })
  respondedAt?: Date;
}

export type FriendshipDocument = HydratedDocument<Friendship>;
export const FriendshipSchema = SchemaFactory.createForClass(Friendship);

FriendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

FriendshipSchema.index({ recipient: 1, status: 1, createdAt: -1 });
