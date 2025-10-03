import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cours, CoursSchema } from './schema/cours.schema';
import { CoursService } from './cours.service';
import { CoursController } from './cours.controller';
import { RolesGuard } from '../../auth/guards/roles.guard';

@Module({
  imports: [MongooseModule.forFeature([{ name: Cours.name, schema: CoursSchema }])],
  controllers: [CoursController],
  providers: [CoursService, RolesGuard],
})
export class CoursModule {}
