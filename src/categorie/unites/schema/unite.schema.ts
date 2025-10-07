import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UniteDocument = Unite & Document;

@Schema({ versionKey: false })
export class Unite {
  @Prop({ required: true })
  nom: string;

  @Prop({ required: true, min: 1, max: 7 })
  studyYear: number;
}

export const UniteSchema = SchemaFactory.createForClass(Unite);
