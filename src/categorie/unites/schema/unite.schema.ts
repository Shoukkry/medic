import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UniteDocument = Unite & Document;

@Schema({ versionKey: false })
export class Unite {
  @Prop({ required: true })
  nom: string;
}

export const UniteSchema = SchemaFactory.createForClass(Unite);
