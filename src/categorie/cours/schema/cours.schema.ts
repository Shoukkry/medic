import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Module } from '../../modules/schema/module.schema';

export type CoursDocument = Cours & Document;

@Schema({ versionKey: false })
export class Cours {
  @Prop({ required: true })
  nom: string;

  @Prop({ required: true })
  qcmyear: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true })
  module: mongoose.Types.ObjectId;
}

export const CoursSchema = SchemaFactory.createForClass(Cours);
