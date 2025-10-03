import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { Question, QuestionSchema } from './schemas/question.schema';
import { Unite, UniteSchema } from '../categorie/unites/schema/unite.schema';
import { Module as ModuleEntity, ModuleSchema } from '../categorie/modules/schema/module.schema';
import { Cours, CoursSchema } from '../categorie/cours/schema/cours.schema';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
      { name: Unite.name, schema: UniteSchema },
      { name: ModuleEntity.name, schema: ModuleSchema },
      { name: Cours.name, schema: CoursSchema },
    ]),
  ],
  controllers: [QuestionsController],
  providers: [QuestionsService, RolesGuard],
})
export class QuestionsModule {}
