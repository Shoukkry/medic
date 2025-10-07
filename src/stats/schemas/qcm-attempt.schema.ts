import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class QcmAttempt {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  score: number;

  @Prop({ required: true })
  total: number;

  @Prop()
  percentage?: number;

  @Prop()
  niveau?: string;

  @Prop()
  unite?: string;

  @Prop()
  module?: string;

  @Prop()
  cours?: string;

  @Prop()
  duration?: number;

  @Prop()
  timeSpent?: number;

  @Prop({ default: 0 })
  correct?: number;

  @Prop({ default: 0 })
  wrong?: number;

  @Prop({ default: 0 })
  skipped?: number;
}

export type QcmAttemptDocument = HydratedDocument<QcmAttempt>;
export const QcmAttemptSchema = SchemaFactory.createForClass(QcmAttempt);
