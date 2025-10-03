import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Unite } from '../../unites/schema/unite.schema';

export type ModuleDocument = Module & Document;

@Schema({ versionKey: false })
export class Module {
  @Prop({ required: true })
  nom: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Unite', required: true })
  unite: mongoose.Types.ObjectId;
}

export const ModuleSchema = SchemaFactory.createForClass(Module);
