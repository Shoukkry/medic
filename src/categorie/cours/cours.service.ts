import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cours, CoursDocument } from './schema/cours.schema';
import { Model, Types } from 'mongoose';
import { CreateCoursDto } from './dto/create-cours.dto';
import { UpdateCoursDto } from './dto/update-cours.dto';

@Injectable()
export class CoursService {
  constructor(
    @InjectModel(Cours.name) private coursModel: Model<CoursDocument>,
  ) {}

  async create(data: CreateCoursDto) {
    if (!Types.ObjectId.isValid(data.module)) {
      throw new BadRequestException('Identifiant de module invalide');
    }
    const created = await this.coursModel.create(data);
    return this.findOne(created.id);
  }

  findAll(studyYear?: number) {
    const filters: Record<string, any> = {};
    if (typeof studyYear === 'number' && !Number.isNaN(studyYear)) {
      filters.studyYear = studyYear;
    }

    return this.coursModel
      .find(filters)
      .populate({
        path: 'module',
        select: 'nom unite',
        populate: { path: 'unite', select: 'nom' },
      })
      .select('-__v')
      .lean()
      .exec();
  }

  async findByUnite(moduleId: string, studyYear?: number) {
    if (!Types.ObjectId.isValid(moduleId)) {
      throw new BadRequestException('Identifiant de module invalide');
    }
    const filters: Record<string, any> = { module: moduleId };
    if (typeof studyYear === 'number' && !Number.isNaN(studyYear)) {
      filters.studyYear = studyYear;
    }
    return this.coursModel.find(filters).select('-__v').lean().exec();
  }

  findOne(id: string) {
    return this.coursModel
      .findById(id)
      .populate({
        path: 'module',
        select: 'nom unite',
        populate: { path: 'unite', select: 'nom' },
      })
      .select('-__v')
      .lean()
      .exec();
  }

  async update(id: string, data: UpdateCoursDto) {
    if (data.module && !Types.ObjectId.isValid(data.module)) {
      throw new BadRequestException('Identifiant de module invalide');
    }
    const updated = await this.coursModel
      .findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate({
        path: 'module',
        select: 'nom unite',
        populate: { path: 'unite', select: 'nom' },
      })
      .select('-__v')
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException('Cours introuvable');
    }
    return updated;
  }

  async delete(id: string) {
    const deleted = await this.coursModel
      .findByIdAndDelete(id)
      .populate({
        path: 'module',
        select: 'nom unite',
        populate: { path: 'unite', select: 'nom' },
      })
      .select('-__v')
      .lean()
      .exec();

    if (!deleted) {
      throw new NotFoundException('Cours introuvable');
    }
    return deleted;
  }
}
