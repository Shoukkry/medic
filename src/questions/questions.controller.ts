import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(@Body() dto: CreateQuestionDto) {
    return this.questionsService.create(dto);
  }

  @Get()
  async findAll(
    @Query('year') year?: string,
    @Query('studyYear') studyYear?: string,
    @Query('qcmYear') qcmYear?: string,
    @Query('unite') unite?: string,
    @Query('module') module?: string,
    @Query('cours') cours?: string,
    @Query('speciality') speciality?: string,
    @Query('university') university?: string,
  ) {
    const filters: any = {};
    const resolvedYear = studyYear ?? year;
    if (resolvedYear !== undefined) {
      const parsed = Number(resolvedYear);
      if (!Number.isNaN(parsed)) filters.year = parsed;
    }
    if (qcmYear !== undefined) {
      const parsedQcmYear = Number(qcmYear);
      if (!Number.isNaN(parsedQcmYear)) filters.qcmYear = parsedQcmYear;
    }
    if (unite) filters.unite = unite.split(',');
    if (module) filters.module = module.split(',');
    if (cours) filters.cours = cours.split(',');
    if (speciality) filters.speciality = speciality.toLowerCase();
    if (university) filters.university = university.trim();

    return this.questionsService.findAll(filters);
  }

  @Get('random/:count')
  async getRandom(
    @Param('count') count: number,
    @Query('unite') unite?: string,
    @Query('module') module?: string,
    @Query('cours') cours?: string,
    @Query('speciality') speciality?: string,
    @Query('year') year?: string,
    @Query('studyYear') studyYear?: string,
    @Query('university') university?: string,
  ) {
    const filters: any = {};
    if (unite) filters.unite = unite.split(',');
    if (module) filters.module = module.split(',');
    if (cours) filters.cours = cours.split(',');
    if (speciality) filters.speciality = speciality.toLowerCase();

    const resolvedYear = studyYear ?? year;
    if (resolvedYear !== undefined) {
      const parsed = Number(resolvedYear);
      if (!Number.isNaN(parsed)) filters.year = parsed;
    }
    if (university) filters.university = university.trim();

    return this.questionsService.getRandom(Number(count), filters);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.questionsService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async deleteById(@Param('id') id: string) {
    return this.questionsService.deleteById(id);
  }
}
