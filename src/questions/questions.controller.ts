import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
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
    @Query('year') year?: number,
    @Query('qcmYear') qcmYear?: number,
    @Query('unite') unite?: string,
    @Query('module') module?: string,
    @Query('cours') cours?: string,
  ) {
    const filters: any = {};
    if (year) filters.year = +year;
    if (qcmYear) filters.qcmYear = +qcmYear;
    if (unite) filters.unite = unite.split(',');
    if (module) filters.module = module.split(',');
    if (cours) filters.cours = cours.split(',');

    return this.questionsService.findAll(filters);
  }

  @Get('random/:count')
  async getRandom(
    @Param('count') count: number,
    @Query('unite') unite?: string,
    @Query('module') module?: string,
    @Query('cours') cours?: string,
  ) {
    const filters: any = {};
    if (unite) filters.unite = unite.split(',');
    if (module) filters.module = module.split(',');
    if (cours) filters.cours= cours.split(',');

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
