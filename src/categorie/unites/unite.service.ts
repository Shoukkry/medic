import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Unite, UniteDocument } from './schema/unite.schema';
import { CreateUniteDto } from './dto/create-unite.dto';
import { UpdateUniteDto } from './dto/update-unite.dto';

@Injectable()
export class UniteService {
  constructor(
    @InjectModel(Unite.name) private uniteModel: Model<UniteDocument>,
  ) {}

  async create(data: CreateUniteDto) {
    const created = await this.uniteModel.create(data);
    return this.findOne(created.id);
  }

  findAll() {
    return this.uniteModel.find().select('-__v').lean().exec();
  }

  findOne(id: string) {
    return this.uniteModel.findById(id).select('-__v').lean().exec();
  }

  async update(id: string, data: UpdateUniteDto) {
    const updated = await this.uniteModel
      .findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .select('-__v')
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException('Unité introuvable');
    }
    return updated;
  }

  async delete(id: string) {
    const deleted = await this.uniteModel
      .findByIdAndDelete(id)
      .select('-__v')
      .lean()
      .exec();
    if (!deleted) {
      throw new NotFoundException('Unité introuvable');
    }
    return deleted;
  }
}
