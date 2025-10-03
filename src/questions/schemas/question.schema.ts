import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class Question extends Document {
  @Prop({ required: true })
  questionText: string;

  @Prop({ type: [String], required: true })
  options: string[];

  @Prop({ type: [Number], required: true })
  correctAnswer: number[];

  @Prop({ required: false })
  year?: number;

  @Prop({ required: false })
  qcmYear?: number;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Unite' })
  unite: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Module' })
  module: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Cours' })
  cours: Types.ObjectId;
}

export type QuestionDocument = Question & Document;

export const QuestionSchema = SchemaFactory.createForClass(Question);
