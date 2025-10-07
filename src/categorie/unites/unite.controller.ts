import {
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
import { UniteService } from './unite.service';
import { CreateUniteDto } from './dto/create-unite.dto';
import { UpdateUniteDto } from './dto/update-unite.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('unites')
export class UniteController {
  constructor(private readonly uniteService: UniteService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateUniteDto) {
    return this.uniteService.create(dto);
  }

  @Get()
  findAll(@Query('studyYear') studyYear?: string) {
    const parsedStudyYear = Number(studyYear);
    const resolvedStudyYear = Number.isNaN(parsedStudyYear)
      ? undefined
      : parsedStudyYear;
    return this.uniteService.findAll(resolvedStudyYear);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.uniteService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUniteDto) {
    return this.uniteService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.uniteService.delete(id);
  }
}
