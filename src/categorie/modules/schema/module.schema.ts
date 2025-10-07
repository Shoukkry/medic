import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Unite } from '../../unites/schema/unite.schema';

export type ModuleDocument = Module & Document;

@Schema({ versionKey: false })
export class Module {
  @Prop({ required: true })
  nom: string;

  @Prop({ required: true })
  speciality: string;

  @Prop({ required: true, min: 1, max: 7 })
  studyYear: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Unite.name,
    required: true,
  })
  unite: mongoose.Types.ObjectId;
}

export const ModuleSchema = SchemaFactory.createForClass(Module);
