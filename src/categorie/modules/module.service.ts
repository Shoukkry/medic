import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Module, ModuleDocument } from './schema/module.schema';
import { Model, Types } from 'mongoose';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

@Injectable()
export class ModuleService {
  constructor(@InjectModel(Module.name) private moduleModel: Model<ModuleDocument>) {}

  async create(data: CreateModuleDto) {
    if (!Types.ObjectId.isValid(data.unite)) {
      throw new BadRequestException('Identifiant d\'unité invalide');
    }
    const created = await this.moduleModel.create(data);
    return this.findOne(created.id);
  }

  findAll() {
    return this.moduleModel.find().populate('unite', 'nom').select('-__v').lean().exec();
  }

  findOne(id: string) {
    return this.moduleModel.findById(id).populate('unite', 'nom').select('-__v').lean().exec();
  }

  async findByUnite(uniteId: string) {
    if (!Types.ObjectId.isValid(uniteId)) {
      throw new BadRequestException('Identifiant d\'unité invalide');
    }
    return this.moduleModel.find({ unite: uniteId }).select('-__v').lean().exec();
  }

  async update(id: string, data: UpdateModuleDto) {
    if (data.unite && !Types.ObjectId.isValid(data.unite)) {
      throw new BadRequestException('Identifiant d\'unité invalide');
    }
    const updated = await this.moduleModel
      .findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('unite', 'nom')
      .select('-__v')
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException('Module introuvable');
    }
    return updated;
  }

  async delete(id: string) {
    const deleted = await this.moduleModel
      .findByIdAndDelete(id)
      .populate('unite', 'nom')
      .select('-__v')
      .lean()
      .exec();

    if (!deleted) {
      throw new NotFoundException('Module introuvable');
    }
    return deleted;
  }
}
