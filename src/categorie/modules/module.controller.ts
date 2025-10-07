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
import { ModuleService } from './module.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('modules')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateModuleDto) {
    return this.moduleService.create(dto);
  }

  @Get()
  findAll(@Query('studyYear') studyYear?: string) {
    const parsedStudyYear = Number(studyYear);
    const resolvedStudyYear = Number.isNaN(parsedStudyYear)
      ? undefined
      : parsedStudyYear;
    return this.moduleService.findAll(resolvedStudyYear);
  }

  @Get('byUnite')
  async findByUnite(
    @Query('uniteId') uniteId: string,
    @Query('studyYear') studyYear?: string,
  ) {
    if (!uniteId) {
      throw new BadRequestException('uniteId requis en paramètre');
    }
    const parsedStudyYear = Number(studyYear);
    const resolvedStudyYear = Number.isNaN(parsedStudyYear)
      ? undefined
      : parsedStudyYear;
    return this.moduleService.findByUnite(uniteId, resolvedStudyYear);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moduleService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateModuleDto) {
    return this.moduleService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moduleService.delete(id);
  }
}
