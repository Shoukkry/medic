import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CoursService } from './cours.service';
import { CreateCoursDto } from './dto/create-cours.dto';
import { UpdateCoursDto } from './dto/update-cours.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('cours')
export class CoursController {
  constructor(private readonly coursService: CoursService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateCoursDto) {
    return this.coursService.create(dto);
  }

  @Get()
  findAll(@Query('studyYear') studyYear?: string) {
    const parsedStudyYear = Number(studyYear);
    const resolvedStudyYear = Number.isNaN(parsedStudyYear)
      ? undefined
      : parsedStudyYear;
    return this.coursService.findAll(resolvedStudyYear);
  }

  @Get('byModule')
  async findByUnite(
    @Query('moduleId') moduleId: string,
    @Query('studyYear') studyYear?: string,
  ) {
    if (!moduleId) {
      throw new BadRequestException('moduleId requis en paramètre');
    }
    const parsedStudyYear = Number(studyYear);
    const resolvedStudyYear = Number.isNaN(parsedStudyYear)
      ? undefined
      : parsedStudyYear;
    return this.coursService.findByUnite(moduleId, resolvedStudyYear);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCoursDto) {
    return this.coursService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursService.delete(id);
  }
}
